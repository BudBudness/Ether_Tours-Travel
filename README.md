# Ether Tours & Travel

A mobile-first East African travel website for international and regional travellers. The current release is enquiry-first: travellers explore tour ideas and request a tailored quotation. Online booking and payments remain deferred until operational availability, supplier workflows and payment handling are verified.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth and Row Level Security
- Vercel hosting
- GitHub source control and CI

## Current website

- Responsive homepage and East African travel positioning
- Tour-category and destination discovery pages
- Dynamic tour-detail route backed by approved/published Supabase records
- Route-specific canonical metadata, sitemap and robots policy
- Secure enquiry form and server-side endpoint implemented on the feature branch
- Cloudflare Turnstile anti-spam verification and honeypot
- Supabase server-side enquiry storage and Resend staff notification workflow
- About, contact, privacy and terms pages
- Health endpoint at `/api/health`

## Enquiry release gate

The public form stays closed unless the operator configures the required environment variables, explicitly enables enquiry intake, and marks the published privacy notice approved. The Vercel project currently has no environment variables configured, so production enquiry submission is not yet enabled.

See [Client Enquiry Setup](docs/CLIENT-ENQUIRY-SETUP.md) for configuration, required operator decisions and end-to-end verification steps. Never expose a Supabase service-role key or other privileged credential through `NEXT_PUBLIC_*` variables.

## Local setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local` and configure the required public Supabase variables.
3. Run `npm install`.
4. Run `npm run dev` and open `http://localhost:3000`.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`

CI runs these checks on pull requests and pushes to `main`. Do not treat a successful build as proof of live enquiry delivery; verify the database, anti-spam provider, email sender and staff inbox end-to-end before release.

## Content integrity and launch

No package price, availability, review, licence or business credential should be treated as verified solely because it appeared on the old site. Current tour categories are illustrative; package prices, dates, itinerary details, inclusions, exclusions and media rights require operator approval. Contact details and legal policies must be verified and approved before publication. An enquiry is not a booking confirmation.
