-- Content-only editor for Ether Tours & Travel.
-- The client may draft/revise catalogue content but cannot publish it or access enquiries.
-- Replace this fixed editor email only through a reviewed migration when ownership changes.

create policy "Content editor can read all destinations"
  on public.destinations for select to authenticated
  using ((select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com');

create policy "Content editor can create draft destinations"
  on public.destinations for insert to authenticated
  with check (
    (select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com'
    and status in ('draft', 'review')
  );

create policy "Content editor can revise unpublished destinations"
  on public.destinations for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com')
  with check (
    (select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com'
    and status in ('draft', 'review', 'archived')
  );

create policy "Content editor can read all tours"
  on public.tours for select to authenticated
  using ((select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com');

create policy "Content editor can create draft tours"
  on public.tours for insert to authenticated
  with check (
    (select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com'
    and status in ('draft', 'review')
  );

create policy "Content editor can revise tours without publishing"
  on public.tours for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com')
  with check (
    (select auth.jwt() ->> 'email') = 'ethertoursandtravel26@gmail.com'
    and status in ('draft', 'review', 'archived')
  );

grant select, insert, update on public.destinations, public.tours to authenticated;

-- Keep public catalogue tables RLS-protected. Do not grant editor access to enquiries,
-- enquiry_items, enquiry_events, tour pricing, or application configuration.
