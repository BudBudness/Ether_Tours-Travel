# Cloudflare migration — controlled implementation contract

Status: architecture gate; no production resources changed.

## Target runtime

- Cloudflare Worker: public Next.js-compatible application/API runtime only after the framework deployment mode is selected and validated.
- D1: catalogue, enquiry, enquiry-item, enquiry-event and editorial records.
- R2: tour media and uploaded assets; store object keys, never public credentials.
- Turnstile: abuse mitigation for public enquiry intake.
- Email: provider adapter using a server-only Worker secret; do not assume delivery until a verified sender and recipient are supplied.
- GitHub Actions: tests, migrations validation, preview deployment and release approval.

## Current state and incompatibilities

The existing application is Next.js 15 and uses `@supabase/ssr`, Supabase Auth, PostgreSQL enums/UUIDs, `auth.users`, and Supabase RLS. The existing catalogue migration is PostgreSQL-specific. It cannot be applied unchanged to D1. The open draft PR #3 adds a Supabase service-role enquiry path and Vercel-specific setup; it is not a Cloudflare migration and must not be merged as the target architecture.

## Required port

1. Replace Supabase browser/server clients with explicit repository interfaces; no application route should import a vendor client directly.
2. Implement D1 repositories using prepared statements and bound parameters. Convert PostgreSQL enums to checked TEXT columns, UUID defaults to application-generated IDs, timestamptz to ISO-8601 TEXT, and JSONB to validated JSON TEXT.
3. Replace `auth.users` foreign keys with an application-owned identity table only after selecting and implementing the authentication model. Until then, do not expose editor writes or staff enquiry reads.
4. Convert PostgreSQL policies into explicit Worker authorization checks. D1 has no equivalent Supabase RLS boundary. Deny by default; public routes may read published catalogue records only.
5. Move media to R2 with upload authorization, MIME/size limits, random object keys, and private-by-default writes.
6. Keep enquiry intake disabled until privacy notice approval, Turnstile validation, rate limiting, secure D1 persistence, notification failure handling, and staff access controls pass tests.
7. Use a transactional outbox for notification delivery; make processing idempotent and retain a durable failure state.
8. Add forward-only, numbered D1 migrations and a tested export/restore procedure before any production data move.

## Data model mapping

| Existing PostgreSQL feature | D1 implementation |
| --- | --- |
| UUID / gen_random_uuid() | application-generated UUID text |
| enum types | TEXT plus CHECK constraints |
| timestamptz | ISO-8601 UTC TEXT |
| JSONB | validated JSON TEXT |
| auth.users FK | deferred until identity model is approved |
| RLS policies | explicit Worker authorization and repository scoping |
| Supabase Storage | R2 object keys and controlled access |

## Release gates

- [ ] Decide the Cloudflare application runtime and validate the current Next.js feature set against it.
- [ ] Identity/authentication model documented and implemented; editor and staff routes deny anonymous access.
- [ ] D1 schema and migration tests pass against local D1.
- [ ] Public catalogue tests prove only published tours/destinations and approved current prices are exposed.
- [ ] Enquiry tests cover validation, origin, Turnstile, rate limiting, duplicate requests, outbox retry and private access.
- [ ] R2 upload tests cover MIME, size, ownership, object key randomization and unauthorized reads.
- [ ] Export, restore and rollback rehearsal succeeds with checksums and row counts.
- [ ] Preview deployment passes end-to-end tests.
- [ ] Operator approves domain/DNS cutover and any production data migration separately.

## Explicit non-actions

No production DNS, Cloudflare account resources, secrets, customer data, or legacy Supabase project are changed by this document. Do not enable enquiries or merge the legacy Supabase/Vercel PR as a substitute for the Cloudflare port.
