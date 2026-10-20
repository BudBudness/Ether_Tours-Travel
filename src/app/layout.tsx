import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ether-tours-travel.vercel.app"),
  title: { default: "Ether Tours & Travel | Explore East Africa", template: "%s | Ether Tours & Travel" },
  description: "Discover East African safaris, primate encounters and tailored journeys. Explore trips and request a personalised quotation.",
  openGraph: { type: "website", siteName: "Ether Tours & Travel", title: "Ether Tours & Travel", description: "Discover East Africa, one journey at a time." },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
