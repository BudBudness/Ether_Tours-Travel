import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Tour = { id: string; slug: string; title: string; summary: string; description: string | null; duration_days: number; duration_nights: number; price_on_request: boolean };
type Day = { day_number: number; title: string; description: string; accommodation_notes: string | null };
type Inclusion = { item: string; item_type: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("tours").select("title,summary").eq("slug", slug).eq("status", "published").maybeSingle();
    if (data) return { title: data.title, description: data.summary, alternates: { canonical: `/tours/${slug}` }, openGraph: { url: `/tours/${slug}` } };
  } catch { /* Missing environment/database is handled by the page fallback. */ }
  return { title: "Tour details", alternates: { canonical: `/tours/${slug}` }, openGraph: { url: `/tours/${slug}` } };
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let tour: Tour | null = null;
  let days: Day[] = [];
  let inclusions: Inclusion[] = [];
  try {
    const supabase = await createClient();
    const result = await supabase.from("tours").select("id,slug,title,summary,description,duration_days,duration_nights,price_on_request").eq("slug", slug).eq("status", "published").maybeSingle();
    if (result.error || !result.data) notFound();
    tour = result.data as Tour;
    const [dayResult, inclusionResult] = await Promise.all([
      supabase.from("itinerary_days").select("day_number,title,description,accommodation_notes").eq("tour_id", tour.id).order("day_number"),
      supabase.from("tour_inclusions").select("item,item_type").eq("tour_id", tour.id).order("sort_order"),
    ]);
    days = (dayResult.data || []) as Day[];
    inclusions = (inclusionResult.data || []) as Inclusion[];
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    notFound();
  }
  if (!tour) notFound();
  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-8 md:px-10"><div className="mx-auto max-w-5xl"><Link href="/tours" className="text-sm text-moss"><ArrowLeft className="mr-2 inline" size={15}/>All tours</Link><section className="py-14 md:py-20"><p className="text-xs font-semibold uppercase tracking-[.25em] text-moss">Tour overview</p><h1 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">{tour.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">{tour.summary}</p><div className="mt-7 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-[#f0ede4] px-4 py-2">{tour.duration_days} days</span><span className="rounded-full bg-[#f0ede4] px-4 py-2">{tour.duration_nights} nights</span></div><div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-widest text-moss">Plan this journey</p><p className="mt-3 text-sm leading-6 text-stone-600">Tell us your preferred dates, group size and interests. Our team will help tailor the arrangements to your trip.</p><Link href={`/enquire?tour=${encodeURIComponent(tour.slug)}`} className="mt-5 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Enquire about this tour <ArrowRight className="ml-2" size={15}/></Link></div>{tour.description && <div className="prose prose-stone mt-10 max-w-3xl"><p className="whitespace-pre-line leading-7">{tour.description}</p></div>}</section>
  {days.length > 0 && <section className="border-t border-stone-200 py-10"><h2 className="text-2xl font-semibold">Your itinerary</h2><div className="mt-6 space-y-5">{days.map(day=><article key={day.day_number} className="rounded-2xl border border-stone-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-widest text-moss">Day {day.day_number}</p><h3 className="mt-2 text-xl font-semibold">{day.title}</h3><p className="mt-3 leading-7 text-stone-600">{day.description}</p>{day.accommodation_notes && <p className="mt-3 text-sm text-stone-500">Accommodation: {day.accommodation_notes}</p>}</article>)}</div></section>}
  {inclusions.length > 0 && <section className="border-t border-stone-200 py-10"><h2 className="text-2xl font-semibold">Package details</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{inclusions.map((item,i)=><p key={i} className="flex gap-3 text-sm leading-6 text-stone-600"><CheckCircle2 className="mt-1 shrink-0 text-moss" size={17}/><span><strong className="capitalize text-ink">{item.item_type.replaceAll("_"," ")}:</strong> {item.item}</span></p>)}</div></section>}
  <p className="mb-12 text-xs leading-5 text-stone-500">An enquiry is not a reservation. Final dates, permits, suppliers, package inclusions and quotation validity must be confirmed by Ether Tours & Travel.</p></div></main>;
}
