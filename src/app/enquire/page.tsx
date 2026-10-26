import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata = {
  title: "Request a Quotation",
  description: "Tell Ether Tours & Travel about the journey you want to plan.",
};

export default function EnquirePage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const privacyVersion = process.env.ETHER_PRIVACY_NOTICE_VERSION ?? "";

  const configured =
    process.env.ETHER_ENQUIRIES_ENABLED === "true" &&
    process.env.ETHER_PRIVACY_NOTICE_APPROVED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    Boolean(process.env.TURNSTILE_SECRET_KEY) &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.ETHER_ENQUIRY_RECIPIENT) &&
    Boolean(process.env.ETHER_ENQUIRY_FROM) &&
    Boolean(privacyVersion) &&
    Boolean(siteKey);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#fbfaf7] px-5 md:px-10">
        <section className="mx-auto max-w-4xl py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-moss">Start planning</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">Tell us about your journey.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-stone-600">
            Share your travel interests, preferred dates and group size. Ether will review your requirements and respond with the next steps.
          </p>

          {!configured ? (
            <div className="mt-9 rounded-2xl border border-amber-700/20 bg-[#f0ede4] p-6 md:p-8">
              <ShieldCheck className="text-forest" size={25} />
              <h2 className="mt-4 text-xl font-semibold">Secure enquiry setup is not complete</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                The form remains closed until secure storage, anti-spam verification, staff email notifications and an approved privacy notice are configured. No information entered here is collected.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/tours" className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245846]">Explore tour ideas</Link>
                <Link href="/contact" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold">Contact page</Link>
              </div>
            </div>
          ) : (
            <EnquiryForm siteKey={siteKey} privacyVersion={privacyVersion} />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
