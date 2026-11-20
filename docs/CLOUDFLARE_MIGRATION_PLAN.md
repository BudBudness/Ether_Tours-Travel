# Cloudflare Migration Plan — Ether Tours & Travel

Status: implementation specification; no production resources or data migration claimed.

## Target platform
- Next.js App Router deployed to Cloudflare Workers through the OpenNext Cloudflare adapter.
- D1 for destinations, tours, itinerary days, approved pricing, inclusions, enquiries and audit events.
- R2 for operator-approved tour media and private enquiry attachments (if introduced).
- Turnstile and server-side rate limiting for public enquiry submissions.
- Cloudflare Access with MFA for staff administration only. Public travellers must not be forced through an Access login.
- GitHub Actions for deterministic build, migration, test and release gates.

## Migration boundaries
- Remove `@supabase/ssr`, `@supabase/supabase-js`, Supabase environment variables and all Vercel deployment assumptions.
- Translate the existing catalogue schema into ordered D1 SQLite migrations. Preserve publication status, price validity, tour/itinerary relationships and privacy constraints.
- Replace server-side catalogue reads with parameterized D1 queries through Worker bindings.
- Implement a validated POST enquiry endpoint with Turnstile verification, input bounds, rate limits, consent/version capture, idempotency and audit events before enabling the form.
- Keep enquiry records private; staff access is enforced at the Worker API using verified Cloudflare Access JWT claims and explicit staff roles.
- Do not add online booking or payment processing in this release.

## Data and security
- No existing Supabase export or verified production dataset is established by this plan. Do not claim data recovery or import.
- Do not seed unverified tours, prices, availability, permits, credentials or reviews.
- R2 objects are private by default; use short-lived authorized downloads where private files are needed.
- Store secrets only as Worker secrets. Never commit credentials.
- Add D1 backup/export and restore verification before production cutover.

## Acceptance gates
1. Supabase/Vercel package, source, environment and documentation references removed or explicitly historical.
2. D1 migrations apply cleanly to a disposable local database.
3. Catalogue queries return only published tours and currently approved prices.
4. Enquiry tests cover invalid input, Turnstile rejection, rate limits, duplicate submissions, consent and private staff access.
5. Production build and Worker dry-run pass.
6. Browser E2E verifies catalogue, tour details, enquiry and health endpoints.
7. D1 backup restore and production smoke tests pass before DNS/cutover.

## Current limitations
The existing enquiry page is deliberately non-submitting. It must remain so until the complete server-side path and privacy controls pass the gates above. Cloudflare account provisioning and production deployment require an authorized Cloudflare control-plane session.
