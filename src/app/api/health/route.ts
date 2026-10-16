import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json({ service: "ether-tours-travel", ok: true, release: "enquiry-first-scaffold" }, { headers: { "Cache-Control": "no-store" } });
}
