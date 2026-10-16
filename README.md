# Ether Tours & Travel

A professional East African tours website for international and regional travellers. Release 1 focuses on a verified tour catalogue and enquiry-first booking; online reservations and payments are intentionally deferred.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth and Row Level Security
- Vercel hosting
- GitHub source control and CI

## Local setup

1. Install Node.js 22 or newer and npm.
2. Copy `.env.example` to `.env.local` and configure the Supabase project values.
3. Install dependencies with `npm ci` (or `npm install` if no lockfile exists yet).
4. Run `npm run dev` and open `http://localhost:3000`.

## Content integrity

Tour prices, availability, itinerary details, reviews and operator credentials are not assumed to be verified. Audit and approve source data before publishing it. Enquiry submission is not a booking confirmation.

## Database

Apply SQL migrations in `supabase/migrations` using the Supabase CLI or SQL editor. Review RLS policies before exposing production data.

## Release 1 scope

- Responsive marketing homepage
- Tour catalogue and tour detail routes
- Enquiry-first workflow foundation
- Supabase schema and public catalogue policies
- GitHub CI starter

Admin workflows, email delivery, live inventory and payments require subsequent implementation and configuration.
