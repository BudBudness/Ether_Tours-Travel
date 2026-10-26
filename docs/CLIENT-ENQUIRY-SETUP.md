# Ether Tours & Travel — Client Enquiry Setup

The secure enquiry form and server endpoint are implemented on the feature branch. The public form must remain disabled until the operator completes the configuration and launch checks below. Do not send passwords, API secrets, or payment details in this document or chat.

## Required Vercel environment

Set these in the Vercel project environment settings; never commit secret values:
- `ETHER_ENQUIRIES_ENABLED=true` only after every launch gate passes.
- `ETHER_PRIVACY_NOTICE_APPROVED=true` only after the final privacy notice has been reviewed, published and approved by the operator.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never a `NEXT_PUBLIC_*` variable).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
- `RESEND_API_KEY`.
- `ETHER_ENQUIRY_RECIPIENT` (approved staff inbox).
- `ETHER_ENQUIRY_FROM` (sender on a verified Resend domain).
- `ETHER_PRIVACY_NOTICE_VERSION` (version of the approved published privacy notice).

The endpoint fails closed if configuration is missing or the privacy approval flag is false. It validates payloads and origin, applies a honeypot and Cloudflare Turnstile verification, writes enquiry and trip details through the server-only Supabase service key, then sends a Resend notification. If notification delivery fails after storage, the response includes the reference and a warning; the event is logged for staff follow-up.

## Required database

Apply `supabase/migrations/202610160001_initial_catalogue.sql` to the intended Supabase project after review. It defines `enquiries`, `enquiry_items` and `enquiry_events`. The endpoint relies on these tables and their current columns. Service-role access bypasses RLS; keep the service key server-only and do not add public write policies for customer enquiry tables.

## Operator decisions required before launch

- Official business name and approved public contact details.
- Staff recipient inbox and a verified sender domain.
- Legal entity/data controller, privacy contact, purposes, lawful basis, retention period, rights and international-transfer disclosures for the published privacy notice.
- Approved privacy notice text and version identifier.
- Confirmed destinations, tour descriptions, itinerary inclusions/exclusions and permit/park-fee wording.
- Named staff responsible for reviewing enquiries and following up on failed notifications.
- Approved response-time expectations and final launch sign-off.

Do not collect traveller data while the privacy notice is still a draft. The public form remains closed unless all required environment variables are set, the privacy approval flag is true, and the operator explicitly enables it.

## Release verification checklist

1. Run CI: `npm run typecheck`, `npm run lint`, and `npm run build`.
2. Verify a valid Turnstile-protected test enquiry is stored once and returns a reference.
3. Verify malformed email, invalid country codes/dates/counts, missing privacy acknowledgement, honeypot submissions and invalid Turnstile tokens are rejected.
4. Verify anonymous clients cannot read or mutate `enquiries`, `enquiry_items` or `enquiry_events` directly.
5. Verify staff notification arrives at the approved inbox; simulate provider failure and confirm a notification-failure event is logged.
6. Confirm the privacy notice is approved and published before setting `ETHER_PRIVACY_NOTICE_APPROVED=true` and `ETHER_ENQUIRIES_ENABLED=true`.
7. Confirm the production deployment and perform one operator-authorised end-to-end test, then remove the test enquiry.

Never request passport numbers, payment-card details or other sensitive information in the initial enquiry form. An enquiry is not a booking confirmation. Final prices, availability, permits and itineraries must be confirmed by the operator in writing.
