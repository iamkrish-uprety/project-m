-- Where to find things, who's supplying them, and inviting guests.

-- Country drives which shops/directories we surface. The free-text `region`
-- stays as the city, which is what local searches need.
alter table weddings add column if not exists country text not null default 'other';
alter table weddings add column if not exists invitation_message text;

-- A shop the couple found and wants to remember for a specific item.
alter table shopping_items add column if not exists source_name text;
alter table shopping_items add column if not exists source_url text;

-- Services you book rather than buy: venue, catering, photography, ...
create table if not exists plan_suppliers (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  category text not null,
  name text not null,
  url text,
  contact text,
  notes text,
  quoted_cost numeric not null default 0,
  status text not null default 'looking',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'plan_suppliers_status_check') then
    alter table plan_suppliers add constraint plan_suppliers_status_check
      check (status in ('looking', 'shortlisted', 'booked', 'own'));
  end if;
end $$;

create index if not exists plan_suppliers_wedding_idx on plan_suppliers (wedding_id);

alter table plan_suppliers enable row level security;

drop policy if exists "wedding members can read suppliers" on plan_suppliers;
create policy "wedding members can read suppliers"
  on plan_suppliers for select using (has_wedding_access(wedding_id));

drop policy if exists "wedding members can add suppliers" on plan_suppliers;
create policy "wedding members can add suppliers"
  on plan_suppliers for insert with check (has_wedding_access(wedding_id));

drop policy if exists "wedding members can update suppliers" on plan_suppliers;
create policy "wedding members can update suppliers"
  on plan_suppliers for update using (has_wedding_access(wedding_id));

drop policy if exists "wedding members can delete suppliers" on plan_suppliers;
create policy "wedding members can delete suppliers"
  on plan_suppliers for delete using (has_wedding_access(wedding_id));
