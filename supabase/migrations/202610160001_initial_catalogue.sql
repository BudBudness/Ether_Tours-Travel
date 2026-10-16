-- Ether Tours & Travel: public catalogue and enquiry foundation.
-- Apply in a non-production Supabase project first; review RLS before release.
create extension if not exists pgcrypto;

create type public.publication_status as enum ('draft', 'review', 'published', 'archived');
create type public.enquiry_status as enum ('new', 'under_review', 'needs_information', 'quoted', 'accepted', 'closed', 'spam');

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code char(2),
  summary text,
  description text,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text,
  duration_days integer not null check (duration_days > 0),
  duration_nights integer not null default 0 check (duration_nights >= 0),
  price_on_request boolean not null default true,
  featured boolean not null default false,
  status public.publication_status not null default 'draft',
  seo_title text,
  seo_description text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tour_destinations (
  tour_id uuid not null references public.tours(id) on delete cascade,
  destination_id uuid not null references public.destinations(id) on delete restrict,
  primary key (tour_id, destination_id)
);

create table public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text not null,
  description text not null,
  accommodation_notes text,
  unique (tour_id, day_number)
);

create table public.tour_pricing (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  currency char(3) not null,
  amount numeric(12,2),
  pricing_basis text not null check (pricing_basis in ('per_person', 'per_group', 'per_vehicle', 'custom_quote')),
  valid_from date,
  valid_until date,
  status text not null default 'pending_verification' check (status in ('pending_verification', 'approved', 'expired', 'withdrawn')),
  source_note text,
  check (valid_until is null or valid_from is null or valid_until >= valid_from),
  check ((pricing_basis = 'custom_quote' and amount is null) or (pricing_basis <> 'custom_quote' and amount is not null)),
  check (amount is null or amount >= 0)
);

create table public.tour_inclusions (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  item text not null,
  item_type text not null check (item_type in ('included', 'excluded', 'important_note')),
  sort_order integer not null default 0
);

create table public.tour_media (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  attribution text,
  sort_order integer not null default 0
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('ETH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_name text not null check (length(trim(customer_name)) between 2 and 120),
  email text not null check (length(email) <= 254),
  phone text,
  country_code char(2),
  preferred_contact text not null default 'email' check (preferred_contact in ('email', 'phone', 'whatsapp')),
  status public.enquiry_status not null default 'new',
  assigned_to uuid references auth.users(id) on delete set null,
  privacy_notice_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiry_items (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  tour_id uuid references public.tours(id) on delete set null,
  requested_start_date date,
  adults integer not null default 1 check (adults between 1 and 100),
  children integer not null default 0 check (children between 0 and 100),
  notes text check (notes is null or length(notes) <= 3000),
  created_at timestamptz not null default now()
);

create table public.enquiry_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index tours_published_idx on public.tours(status, featured) where status = 'published';
create index destinations_published_idx on public.destinations(status, name) where status = 'published';
create index enquiries_status_created_idx on public.enquiries(status, created_at desc);
create index enquiry_items_enquiry_idx on public.enquiry_items(enquiry_id);

alter table public.destinations enable row level security;
alter table public.tours enable row level security;
alter table public.tour_destinations enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.tour_pricing enable row level security;
alter table public.tour_inclusions enable row level security;
alter table public.tour_media enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_items enable row level security;
alter table public.enquiry_events enable row level security;

create policy "Published destinations are public" on public.destinations
  for select to anon, authenticated using (status = 'published');
create policy "Published tours are public" on public.tours
  for select to anon, authenticated using (status = 'published');
create policy "Published tour destination links are public" on public.tour_destinations
  for select to anon, authenticated using (
    exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published')
    and exists (select 1 from public.destinations d where d.id = destination_id and d.status = 'published')
  );
create policy "Published itineraries are public" on public.itinerary_days
  for select to anon, authenticated using (
    exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published')
  );
create policy "Approved current prices are public" on public.tour_pricing
  for select to anon, authenticated using (
    status = 'approved'
    and (valid_from is null or valid_from <= current_date)
    and (valid_until is null or valid_until >= current_date)
    and exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published')
  );
create policy "Published tour inclusions are public" on public.tour_inclusions
  for select to anon, authenticated using (
    exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published')
  );
create policy "Published tour media are public" on public.tour_media
  for select to anon, authenticated using (
    exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published')
  );

-- No direct public writes or reads for customer enquiries/events.
-- Implement a validated server-side submission path and explicit staff policies before accepting enquiries.
revoke all on public.enquiries, public.enquiry_items, public.enquiry_events from anon, authenticated;
revoke all on public.destinations, public.tours, public.tour_destinations, public.itinerary_days, public.tour_pricing, public.tour_inclusions, public.tour_media from anon, authenticated;
grant select on public.destinations, public.tours, public.tour_destinations, public.itinerary_days, public.tour_pricing, public.tour_inclusions, public.tour_media to anon, authenticated;

-- No seed prices or tours are inserted. The operator must verify and approve content before publication.
