# Ether Tours Cloudflare catalogue slice

This folder contains the initial read-only Cloudflare Worker + D1 catalogue API.

## Routes

- GET /health
- GET /api/destinations — published destinations only.
- GET /api/tours — published tours only; supports page, limit (maximum 50), featured=true, and destination=<slug>.
- GET /api/tours/:slug — published tour detail, published destinations, itinerary, inclusions, and approved prices whose validity dates include the current UTC date.

Enquiry submission, staff access, identity, notifications, R2 media delivery and all writes remain disabled. Media object keys are not returned by the public API.

## Local verification

From the repository root:

    python cloudflare/tests/validate_migration.py

## Local Worker run

1. Create a D1 database in the Cloudflare account.
2. Copy cloudflare/wrangler.toml.example to cloudflare/wrangler.toml and replace the database ID with the actual D1 ID.
3. Apply migrations locally with npx wrangler --config cloudflare/wrangler.toml d1 migrations apply ether-tours --local.
4. Start the Worker with npx wrangler --config cloudflare/wrangler.toml dev --local.

No database ID, Cloudflare credentials, production binding, deployment, or DNS change is included in this repository slice.
