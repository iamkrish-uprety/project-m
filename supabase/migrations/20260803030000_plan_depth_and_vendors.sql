-- Phase 2/3 groundwork:
--   * richer checklist/shopping/guest fields
--   * sub-tradition variant on the wedding
--   * profiles table so collaborators can see who else is on a plan
--   * vendors + reviews (Phase 3 directory)

-- ---------------------------------------------------------------- plan depth

alter table checklist_items add column if not exists due_date date;
alter table checklist_items add column if not exists notes text;

alter table shopping_items add column if not exists estimated_cost numeric not null default 0;
alter table shopping_items add column if not exists notes text;

alter table guests add column if not exists email text;
alter table guests add column if not exists phone text;
alter table guests add column if not exists plus_ones int not null default 0;
alter table guests add column if not exists rsvp text not null default 'pending';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'guests_rsvp_check') then
    alter table guests add constraint guests_rsvp_check
      check (rsvp in ('pending', 'yes', 'no'));
  end if;
end $$;

alter table weddings add column if not exists tradition_variant text;

-- ------------------------------------------------------------------ profiles
-- auth.users is not readable from the client, but a collaborator list needs
-- to show *who* has access. Mirror just the email into a public table.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

insert into profiles (id, email)
  select id, email from auth.users
  on conflict (id) do update set email = excluded.email;

-- You may read a profile if it's yours, or if you share a wedding with them.
create or replace function shares_wedding_with(other_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from weddings w
    where (
      w.owner_id = auth.uid()
      or exists (select 1 from wedding_collaborators c
                 where c.wedding_id = w.id and c.user_id = auth.uid())
    )
    and (
      w.owner_id = other_user_id
      or exists (select 1 from wedding_collaborators c2
                 where c2.wedding_id = w.id and c2.user_id = other_user_id)
    )
  );
$$;

alter table profiles enable row level security;

drop policy if exists "read own or co-planner profiles" on profiles;
create policy "read own or co-planner profiles"
  on profiles for select
  using (id = auth.uid() or shares_wedding_with(id));

-- ------------------------------------------------------------------- vendors
-- Listings are submitted by users and stay unpublished until reviewed, so an
-- empty/unmoderated directory can't present unverified businesses as vetted.

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  traditions text[] not null default '{}',
  region text not null default '',
  description text,
  contact_email text,
  contact_phone text,
  website text,
  submitted_by uuid references auth.users(id) on delete set null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (vendor_id, user_id)
);

create index if not exists vendors_published_idx on vendors (published);
create index if not exists vendor_reviews_vendor_idx on vendor_reviews (vendor_id);

alter table vendors enable row level security;
alter table vendor_reviews enable row level security;

drop policy if exists "anyone can read published vendors" on vendors;
create policy "anyone can read published vendors"
  on vendors for select
  using (published or submitted_by = auth.uid());

drop policy if exists "authenticated users can submit vendors" on vendors;
create policy "authenticated users can submit vendors"
  on vendors for insert
  with check (submitted_by = auth.uid() and published = false);

drop policy if exists "submitters can edit their own unpublished vendors" on vendors;
create policy "submitters can edit their own unpublished vendors"
  on vendors for update
  using (submitted_by = auth.uid());

drop policy if exists "anyone can read reviews" on vendor_reviews;
create policy "anyone can read reviews"
  on vendor_reviews for select
  using (true);

drop policy if exists "users manage their own reviews" on vendor_reviews;
create policy "users manage their own reviews"
  on vendor_reviews for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
