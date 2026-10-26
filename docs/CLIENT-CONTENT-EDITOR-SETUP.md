# Client content editor setup

The private content editor lives at `/admin/content`. It is intended for the single content editor `ethertoursandtravel26@gmail.com`; it does not grant repository, Vercel, database administration, or customer-enquiry access.

## Required before use

1. Connect this repository to a **dedicated Ether Tours & Travel Supabase project**. Do not use the Little Oaks or A1OS projects.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project for the single public site.
3. Apply migrations in order, including `202610260001_content_editor_access.sql`, to that same Supabase project.
4. In Supabase Auth, allow the editor email `ethertoursandtravel26@gmail.com` to sign in. Use an invite or create the user in the dashboard, and ensure the email is confirmed. Configure the Auth site URL and redirect allow-list to include the production site's `/admin/content` URL.
5. Run the app checks and verify the email magic-link sign-in, editor-only row access, and rejection of a different account before enabling the dashboard for the client.

## What the client can edit

- Existing tour text, duration and SEO metadata.
- Existing destination names, slugs and descriptions.
- Save edits as draft/review content only. The client cannot publish.

## What remains owner-controlled

- Publishing and production release.
- Code, GitHub, Vercel, environment variables and database configuration.
- Enquiries and customer personal information.
- Pricing tables and other operational data.

The migration is intentionally scoped to tours and destinations. It does not seed unverified tour data or prices. Public content appears only when the owner publishes it.
