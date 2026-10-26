import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Destinations", description: "Explore destination ideas across East Africa.", alternates: { canonical: "/destinations" }, openGraph: { url: "/destinations" } };
type Destination = { id: string; name: string; slug: string; summary: string | null; description: string | null };
const defaults = [{name:"Uganda",text:"Wildlife, primates, lakes, forests and the Nile."},{name:"Rwanda",text:"Volcanic landscapes, culture and primate experiences."},{name:"Kenya",text:"Savannah wildlife, coastlines and varied landscapes."},{name:"Tanzania",text:"Iconic wildlife areas and mountain-to-coast journeys."}];

async function getDestinations(): Promise<Destination[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("destinations").select("id,name,slug,summary,description").eq("status", "published").order("name");
    if (error) return [];
    return (data ?? []) as Destination[];
  } catch { return []; }
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();
  return <><SiteHeader/><main className="min-h-screen bg-[#fbfaf7] px-5 md:px-10"><section className="mx-auto max-w-6xl py-16 md:py-24"><p className="text-xs font-semibold uppercase tracking-[.25em] text-moss">Explore the region</p><h1 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">East Africa, many ways.</h1><p className="mt-5 max-w-2xl leading-7 text-stone-600">Start with a destination and shape the details around your dates and interests. Routes, border requirements and availability must be checked for each journey.</p><div className="mt-10 grid gap-4 sm:grid-cols-2">{destinations.length ? destinations.map((d,i)=><article key={d.id} className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"><span className="text-xs font-semibold tracking-[.2em] text-amber-700">0{i+1} / DESTINATION</span><h2 className="mt-4 text-2xl font-semibold">{d.name}</h2><p className="mt-3 max-w-md text-sm leading-6 text-stone-600">{d.summary || d.description || "Ask our team to help plan a journey here."}</p><Link href={`/enquire?destination=${encodeURIComponent(d.slug)}`} className="mt-6 inline-flex items-center text-sm font-semibold text-forest">Plan a trip <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={15}/></Link></article>) : defaults.map((d,i)=><article key={d.name} className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"><span className="text-xs font-semibold tracking-[.2em] text-amber-700">0{i+1} / DESTINATION</span><h2 className="mt-4 text-2xl font-semibold">{d.name}</h2><p className="mt-3 max-w-md text-sm leading-6 text-stone-600">{d.text}</p><Link href="/enquire" className="mt-6 inline-flex items-center text-sm font-semibold text-forest">Plan a trip <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={15}/></Link></article>)}</div></section></main><SiteFooter/></>;
}
