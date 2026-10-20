import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

const links = [
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return <header className="relative z-20 border-b border-forest/10 bg-[#fbfaf7]/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
      <Link href="/" className="flex shrink-0 items-center gap-3 text-forest" aria-label="Ether Tours & Travel home">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-forest/25"><Compass size={20}/></span>
        <span><span className="block text-sm font-bold tracking-[.2em]">ETHER</span><span className="block text-[9px] tracking-[.22em] text-stone-500">TOURS & TRAVEL</span></span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex" aria-label="Main navigation">
        {links.map(link => <Link key={link.href} href={link.href} className="transition-colors hover:text-forest">{link.label}</Link>)}
      </nav>
      <Link href="/enquire" className="inline-flex items-center rounded-full bg-amber px-4 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#e7bd78] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">Plan a trip <ArrowRight className="ml-2" size={15}/></Link>
    </div>
    <nav className="flex gap-5 overflow-x-auto border-t border-forest/5 px-5 py-3 text-xs text-stone-600 md:hidden" aria-label="Mobile navigation">
      {links.map(link => <Link key={link.href} href={link.href} className="shrink-0">{link.label}</Link>)}
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="mt-16 border-t border-stone-200 bg-[#f5f1e8]">
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-stone-500 md:flex-row md:items-center md:justify-between lg:px-8">
      <Link href="/" className="font-semibold tracking-[.16em] text-forest">ETHER TOURS & TRAVEL</Link>
      <p>Explore East Africa, one journey at a time.</p>
      <div className="flex gap-5"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div>
    </div>
  </footer>;
}
