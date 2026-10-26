import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnquiryPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  countryCode?: unknown;
  preferredContact?: unknown;
  destination?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  adults?: unknown;
  children?: unknown;
  notes?: unknown;
  privacyAccepted?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
};

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return fail("Request origin could not be verified.", 403);
    } catch {
      return fail("Invalid request origin.", 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) return fail("Request is too large.", 413);

  const enabled = process.env.ETHER_ENQUIRIES_ENABLED === "true";
  const privacyApproved = process.env.ETHER_PRIVACY_NOTICE_APPROVED === "true";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const notificationKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ETHER_ENQUIRY_RECIPIENT;
  const sender = process.env.ETHER_ENQUIRY_FROM;
  const privacyVersion = process.env.ETHER_PRIVACY_NOTICE_VERSION;

  if (!enabled || !privacyApproved || !supabaseUrl || !serviceKey || !turnstileSecret || !notificationKey || !recipient || !sender || !privacyVersion) {
    return fail("The secure enquiry service is not yet available. Please contact the operator through a verified channel.", 503);
  }

  let body: EnquiryPayload;
  try {
    body = await request.json();
  } catch {
    return fail("Please submit a valid enquiry form.", 400);
  }

  // Honeypot: accept silently to avoid teaching bots which field triggered rejection.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });
  if (body.privacyAccepted !== true) return fail("Please acknowledge the privacy notice before submitting.", 400);

  const name = text(body.name, 120);
  const email = text(body.email, 254).toLowerCase();
  const phone = text(body.phone, 40);
  const countryCode = text(body.countryCode, 2).toUpperCase();
  const preferredContact = text(body.preferredContact, 20);
  const destination = text(body.destination, 300);
  const startDate = text(body.startDate, 10);
  const endDate = text(body.endDate, 10);
  const notes = text(body.notes, 3000);
  const adults = Number(body.adults);
  const children = Number(body.children);

  if (name.length < 2) return fail("Enter your name.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.", 400);
  if (phone.length > 0 && phone.length < 7) return fail("Enter a valid phone number or leave it blank.", 400);
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) return fail("Use a two-letter country code, such as UG.", 400);
  if (!["email", "phone", "whatsapp"].includes(preferredContact)) return fail("Choose a valid contact method.", 400);
  if (!Number.isInteger(adults) || adults < 1 || adults > 100) return fail("Adults must be between 1 and 100.", 400);
  if (!Number.isInteger(children) || children < 0 || children > 100) return fail("Children must be between 0 and 100.", 400);
  if (startDate && !isRealDate(startDate)) return fail("Choose a valid start date.", 400);
  if (endDate && !isRealDate(endDate)) return fail("Choose a valid end date.", 400);
  if (startDate && endDate && endDate < startDate) return fail("The end date must be on or after the start date.", 400);

  const token = text(body.turnstileToken, 2048);
  if (!token) return fail("Complete the anti-spam verification before submitting.", 400);

  const remoteIp = request.headers.get("cf-connecting-ip") ?? "";
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: turnstileSecret, response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
    cache: "no-store",
  }).catch(() => null);
  if (!verification?.ok) return fail("Anti-spam verification is temporarily unavailable. Please try again.", 503);
  const verificationResult = await verification.json().catch(() => null) as { success?: boolean } | null;
  if (!verificationResult?.success) return fail("Anti-spam verification failed. Please try again.", 400);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .insert({
      customer_name: name,
      email,
      phone: phone || null,
      country_code: countryCode || null,
      preferred_contact: preferredContact,
      privacy_notice_version: privacyVersion,
    })
    .select("id, reference")
    .single();

  if (enquiryError || !enquiry) {
    console.error("Enquiry insert failed", enquiryError?.code ?? "unknown");
    return fail("We could not save your enquiry. No booking has been made; please try again later.", 503);
  }

  const tripNotes = [
    destination ? `Destination(s): ${destination}` : "",
    endDate ? `Preferred end date: ${endDate}` : "",
    notes,
  ].filter(Boolean).join("\n").slice(0, 3000);

  const { error: itemError } = await supabase.from("enquiry_items").insert({
    enquiry_id: enquiry.id,
    requested_start_date: startDate || null,
    adults,
    children,
    notes: tripNotes || null,
  });

  if (itemError) {
    await supabase.from("enquiries").delete().eq("id", enquiry.id);
    console.error("Enquiry details insert failed", itemError.code);
    return fail("We could not save your enquiry. Please try again later.", 503);
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${notificationKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `New travel enquiry ${enquiry.reference}`,
      text: [
        `Reference: ${enquiry.reference}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not supplied"}`,
        `Preferred contact: ${preferredContact}`,
        `Destination(s): ${destination || "Not specified"}`,
        `Travel dates: ${startDate || "Flexible/not supplied"} to ${endDate || "Not supplied"}`,
        `Travellers: ${adults} adult(s), ${children} child(ren)`,
        `Notes: ${notes || "None"}`,
      ].join("\n"),
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!emailResponse?.ok) {
    await supabase.from("enquiry_events").insert({
      enquiry_id: enquiry.id,
      event_type: "notification_failed",
      metadata: { provider: "resend", reason: "notification_request_failed" },
    });
    console.error("Enquiry saved but staff notification failed", enquiry.reference);
    return NextResponse.json({
      ok: true,
      reference: enquiry.reference,
      notice: "Your enquiry was received, but the team notification was delayed. Please keep this reference for follow-up.",
    });
  }

  return NextResponse.json({ ok: true, reference: enquiry.reference }, { status: 201 });
}
