# Ether Tours & Travel

A professional East African tours website for international and regional travellers. Release 1 focuses on an audited tour catalogue and enquiry-first travel planning. Online reservations and payments are deferred until operational availability and payment workflows are verified.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth and Row Level Security
- Vercel hosting
- GitHub source control and CI

## Local setup
1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local` and configure the Supabase project URL and publishable/anon key.
3. Run `npm install`.
4. Run `npm run dev` and open `http://localhost:3000`.

## Current scaffold
- Responsive homepage with East African travel positioning
- Initial tour catalogue and destination discovery pages
- Enquiry-first route placeholder (submission is not connected yet)
- About, contact, privacy and terms pages
- Health endpoint at `/api/health`
- Supabase browser/server client helpers
- Initial catalogue/enquiry database migration with public-read RLS policies
- GitHub CI starter

## Before production
- Run build, typecheck, lint and SQL migration against a non-production Supabase project.
- Implement a validated server-side enquiry endpoint, rate limiting, spam controls, notifications and staff administration.
- Replace placeholder legal/contact content with operator-approved details.
- Audit all existing tours and approve prices, dates, itinerary details, inclusions and media attribution.
- Configure Vercel environment variables and verify production domain, monitoring, backups and recovery.
- Keep service-role and other privileged keys server-only. Never use them in `NEXT_PUBLIC_*` variables.

## Content integrity
No package price, availability, review, licence or business credential should be treated as verified solely because it appeared on the old site. Enquiry submission is not booking confirmation.
