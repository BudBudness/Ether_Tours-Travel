-- D1 port of the reviewed catalogue/enquiry schema.
-- Identity is intentionally external: assigned_to/actor_id are opaque subject IDs.
-- Apply only to a new D1 database; this does not migrate existing PostgreSQL data.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country_code TEXT CHECK(country_code IS NULL OR length(country_code)=2),
  summary TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL CHECK(duration_days>0),
  duration_nights INTEGER NOT NULL DEFAULT 0 CHECK(duration_nights>=0),
  price_on_request INTEGER NOT NULL DEFAULT 1 CHECK(price_on_request IN (0,1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived')),
  seo_title TEXT,
  seo_description TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tour_destinations (
  tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  PRIMARY KEY(tour_id,destination_id)
);

CREATE TABLE IF NOT EXISTS itinerary_days (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK(day_number>0),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  accommodation_notes TEXT,
  UNIQUE(tour_id,day_number)
);

CREATE TABLE IF NOT EXISTS tour_pricing (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK(length(currency)=3),
  amount_minor INTEGER,
  pricing_basis TEXT NOT NULL CHECK(pricing_basis IN ('per_person','per_group','per_vehicle','custom_quote')),
  valid_from TEXT,
  valid_until TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK(status IN ('pending_verification','approved','expired','withdrawn')),
  source_note TEXT,
  CHECK(valid_until IS NULL OR valid_from IS NULL OR valid_until>=valid_from),
  CHECK((pricing_basis='custom_quote' AND amount_minor IS NULL) OR (pricing_basis<>'custom_quote' AND amount_minor IS NOT NULL)),
  CHECK(amount_minor IS NULL OR amount_minor>=0)
);

CREATE TABLE IF NOT EXISTS tour_inclusions (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('included','excluded','important_note')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tour_media (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  attribution TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL CHECK(length(trim(customer_name)) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK(length(email)<=254),
  phone TEXT,
  country_code TEXT CHECK(country_code IS NULL OR length(country_code)=2),
  preferred_contact TEXT NOT NULL DEFAULT 'email' CHECK(preferred_contact IN ('email','phone','whatsapp')),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','under_review','needs_information','quoted','accepted','closed','spam')),
  assigned_to TEXT,
  privacy_notice_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiry_items (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  tour_id TEXT REFERENCES tours(id) ON DELETE SET NULL,
  requested_start_date TEXT,
  adults INTEGER NOT NULL DEFAULT 1 CHECK(adults BETWEEN 1 AND 100),
  children INTEGER NOT NULL DEFAULT 0 CHECK(children BETWEEN 0 AND 100),
  notes TEXT CHECK(notes IS NULL OR length(notes)<=3000),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiry_events (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  actor_id TEXT,
  event_type TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata_json)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id TEXT PRIMARY KEY,
  aggregate_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL UNIQUE,
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts>=0),
  available_at TEXT NOT NULL,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS tours_published_idx ON tours(status,featured);
CREATE INDEX IF NOT EXISTS destinations_published_idx ON destinations(status,name);
CREATE INDEX IF NOT EXISTS enquiries_status_created_idx ON enquiries(status,created_at DESC);
CREATE INDEX IF NOT EXISTS enquiry_items_enquiry_idx ON enquiry_items(enquiry_id);
CREATE INDEX IF NOT EXISTS outbox_pending_idx ON notification_outbox(status,available_at);
