import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Explore Tours", description: "Explore East African tour ideas and request a tailored quotation.", alternates: { canonical: "/tours" }, openGraph: { url: "/tours" } };
type Tour = { id: string; slug: string; title: string; summary: string; duration_days: number; duration_nights: number };

async function getTours(): Promise<Tour[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tours").select("id,slug,title,summary,duration_days,duration_nights").eq("status", "published").order("featured", { ascending: false }).order("title");
    if (error) return [];
    return (data ?? []) as Tour[];
  } catch { return []; }
}

export default async function ToursPage() {
  const tours = await getTours();
  return <><SiteHeader/><main className="min-h-screen bg-[#fbfaf7] px-5 md:px-10"><section className="mx-auto max-w-6xl py-16 md:py-24">
    <p className="text-xs font-semibold uppercase tracking-[.25em] text-moss">The tour collection</p><h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">Find the journey that feels like yours.</h1>
    <p className="mt-5 max-w-2xl leading-7 text-stone-600">Explore trip ideas across East Africa. Itineraries, inclusions and permit requirements are confirmed for your travel dates before booking.</p>
    {tours.length ? <div className="mt-10 grid gap-6 md:grid-cols-3">{tours.map(tour=><article key={tour.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><p className="text-xs font-semibold uppercase tracking-widest text-moss">Tailored journey</p><h2 className="mt-4 text-xl font-semibold">{tour.title}</h2><p className="mt-3 text-sm leading-6 text-stone-600">{tour.summary}</p><p className="mt-4 text-xs text-stone-500">{tour.duration_days} days · {tour.duration_nights} nights · Quotation on request</p><Link href={`/tours/${tour.slug}`} className="mt-6 inline-flex items-center text-sm font-semibold text-forest">Explore this tour <ArrowRight className="ml-2" size={15}/></Link></article>)}</div> : <div className="mt-10 grid gap-6 md:grid-cols-3">{[{title:"Wildlife safaris",detail:"National parks and classic game drives"},{title:"Gorilla & chimpanzee trekking",detail:"Primate experiences with permit details confirmed individually"},{title:"Adventure & regional trips",detail:"Nile experiences and journeys across East Africa"}].map((item,i)=><article key={item.title} className="rounded-2xl border border-stone-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-widest text-moss">0{i+1} / TOUR IDEA</p><h2 className="mt-4 text-xl font-semibold">{item.title}</h2><p className="mt-3 text-sm leading-6 text-stone-600">{item.detail}</p><Link href="/enquire" className="mt-6 inline-flex items-center text-sm font-semibold text-forest">Ask about this <ArrowRight className="ml-2" size={15}/></Link></article>)}</div>}
    <div className="mt-10 rounded-2xl bg-[#f0ede4] p-6 md:p-8"><h2 className="text-xl font-semibold">Have a specific itinerary in mind?</h2><p className="mt-2 text-sm leading-6 text-stone-600">Share your dates, group size and interests to begin planning a tailored quotation.</p><Link href="/enquire" className="mt-5 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Request a quotation <ArrowRight className="ml-2" size={15}/></Link></div>
  </section></main><SiteFooter/></>;
}
