"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type Props = { siteKey: string; privacyVersion: string };

export function EnquiryForm({ siteKey, privacyVersion }: Props) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [reference, setReference] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    const tour = new URLSearchParams(window.location.search).get("tour");
    if (tour) setDestination(tour.replace(/-/g, " "));
  }, []);

  useEffect(() => {
    if (!siteKey || !window.turnstile || !widgetRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      callback: setToken,
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    setReference("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      countryCode: data.get("countryCode"),
      preferredContact: data.get("preferredContact"),
      destination: data.get("destination"),
      startDate: data.get("startDate"),
      endDate: data.get("endDate"),
      adults: Number(data.get("adults")),
      children: Number(data.get("children")),
      notes: data.get("notes"),
      privacyAccepted: data.get("privacyAccepted") === "on",
      website: data.get("website"),
      turnstileToken: token,
    };

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { ok?: boolean; error?: string; reference?: string; notice?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Your enquiry could not be submitted.");
      setReference(result.reference || "");
      setMessage({ kind: "success", text: result.notice || "Your enquiry has been received. This is not a confirmed booking." });
      form.reset();
      setDestination("");
      setToken("");
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Submission failed. Please try again." });
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = "mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15";
  const labelClass = "block text-sm font-medium text-stone-700";

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => {
        if (!siteKey || !window.turnstile || !widgetRef.current || widgetId.current) return;
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          callback: setToken,
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      }} />
      <form onSubmit={submit} className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>Full name *
            <input className={fieldClass} name="name" autoComplete="name" minLength={2} maxLength={120} required />
          </label>
          <label className={labelClass}>Email address *
            <input className={fieldClass} name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <label className={labelClass}>Phone / WhatsApp
            <input className={fieldClass} name="phone" type="tel" autoComplete="tel" maxLength={40} />
          </label>
          <label className={labelClass}>Country code
            <input className={fieldClass} name="countryCode" placeholder="e.g. UG" maxLength={2} />
          </label>
          <label className={labelClass}>Preferred contact method
            <select className={fieldClass} name="preferredContact" defaultValue="email">
              <option value="email">Email</option>
              <option value="phone">Phone call</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className={labelClass}>Destination or experience
            <input className={fieldClass} name="destination" value={destination} onChange={event => setDestination(event.target.value)} placeholder="e.g. Uganda safari, gorilla trekking" maxLength={300} />
          </label>
          <label className={labelClass}>Preferred start date
            <input className={fieldClass} name="startDate" type="date" />
          </label>
          <label className={labelClass}>Preferred end date
            <input className={fieldClass} name="endDate" type="date" />
          </label>
          <label className={labelClass}>Adults
            <input className={fieldClass} name="adults" type="number" min={1} max={100} defaultValue={2} required />
          </label>
          <label className={labelClass}>Children
            <input className={fieldClass} name="children" type="number" min={0} max={100} defaultValue={0} required />
          </label>
        </div>
        <label className={labelClass}>Trip notes and preferences
          <textarea className={fieldClass} name="notes" rows={5} maxLength={3000} placeholder="Interests, accommodation preferences, accessibility or dietary arrangements you choose to share." />
        </label>
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <div className="space-y-3">
          <div ref={widgetRef} />
          {!siteKey && <p className="text-sm text-red-700">Anti-spam verification is not configured, so submissions are disabled.</p>}
          <label className="flex items-start gap-3 text-sm leading-6 text-stone-600">
            <input className="mt-1" name="privacyAccepted" type="checkbox" required />
            <span>I have read the <a className="font-semibold text-forest underline" href="/privacy">privacy notice</a> and agree that Ether Tours &amp; Travel may use these details to respond to this enquiry. Notice version: {privacyVersion || "pending"}.</span>
          </label>
        </div>
        {message && (
          <div role="status" aria-live="polite" className={`rounded-xl p-4 text-sm ${message.kind === "success" ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
            <p>{message.text}</p>
            {reference && <p className="mt-2 font-semibold">Reference: {reference}</p>}
          </div>
        )}
        <button type="submit" disabled={busy || !token || !siteKey} className="inline-flex items-center justify-center rounded-full bg-forest px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#245846] disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Submitting…" : "Send travel enquiry"}
        </button>
        <p className="text-xs leading-5 text-stone-500">This is an enquiry only. No booking, permit or availability is confirmed until the operator responds in writing.</p>
      </form>
    </>
  );
}
