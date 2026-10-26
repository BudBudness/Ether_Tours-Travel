import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata = {
  title: "Contact",
  description: "Contact Ether Tours & Travel to discuss your travel plans.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

const whatsappUrl = "https://wa.me/256706887049";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#fbfaf7] px-5 md:px-10">
        <section className="mx-auto max-w-4xl py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-moss">Let&apos;s talk travel</p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">Contact Ether Tours &amp; Travel.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-stone-600">
            Tell us what kind of East African journey you have in mind. For trip planning and enquiries, contact us directly on WhatsApp.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-stone-200 bg-white p-6">
              <Mail className="text-moss" size={24} />
              <h2 className="mt-4 text-xl font-semibold">Email</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Our branded business email is being configured. Until it is verified, please use WhatsApp.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-6">
              <MessageCircle className="text-moss" size={24} />
              <h2 className="mt-4 text-xl font-semibold">Phone / WhatsApp</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">+256 706 887049</p>
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245846]"
              >
                <MessageCircle className="mr-2" size={17} /> Message us on WhatsApp
              </Link>
            </article>
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#f0ede4] p-5 text-sm leading-6 text-stone-600">
            <ShieldCheck className="mt-0.5 shrink-0 text-forest" size={20} />
            <p>Trip requests are enquiries, not confirmed bookings. Final prices, availability, permits and itineraries must be confirmed by the operator in writing.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
