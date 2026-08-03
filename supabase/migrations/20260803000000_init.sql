-- Project M — core schema (Phase 1: planning & checklist tool)
-- Vendors/reviews are Phase 3 and intentionally not created yet.

create table if not exists weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  couple_names text not null default '',
  tradition text not null,
  wedding_date date,
  region text not null default '',
  budget_total numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists wedding_collaborators (
  wedding_id uuid not null references weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event text not null,
  task text not null,
  done boolean not null default false,
  sort_order int not null default 0
);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event text not null,
  item text not null,
  bought boolean not null default false,
  sort_order int not null default 0
);

create table if not exists budget_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  category text not null,
  allocated numeric not null default 0,
  spent numeric not null default 0
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  side text,
  invited boolean not null default false
);

-- Helper: is the current user the owner or a collaborator on this wedding?
create or replace function has_wedding_access(target_wedding_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from weddings w
    where w.id = target_wedding_id
      and (
        w.owner_id = auth.uid()
        or exists (
          select 1 from wedding_collaborators c
          where c.wedding_id = w.id and c.user_id = auth.uid()
        )
      )
  );
$$;

alter table weddings enable row level security;
alter table wedding_collaborators enable row level security;
alter table checklist_items enable row level security;
alter table shopping_items enable row level security;
alter table budget_categories enable row level security;
alter table guests enable row level security;

create policy "owner and collaborators can read weddings"
  on weddings for select
  using (has_wedding_access(id));

create policy "owner can insert weddings"
  on weddings for insert
  with check (owner_id = auth.uid());

create policy "owner and collaborators can update weddings"
  on weddings for update
  using (has_wedding_access(id));

create policy "owner can delete weddings"
  on weddings for delete
  using (owner_id = auth.uid());

create policy "wedding members can read collaborators"
  on wedding_collaborators for select
  using (has_wedding_access(wedding_id));

create policy "owner can manage collaborators"
  on wedding_collaborators for all
  using (exists (select 1 from weddings w where w.id = wedding_id and w.owner_id = auth.uid()));

create policy "wedding members can read checklist"
  on checklist_items for select
  using (has_wedding_access(wedding_id));
create policy "wedding members can write checklist"
  on checklist_items for insert with check (has_wedding_access(wedding_id));
create policy "wedding members can update checklist"
  on checklist_items for update using (has_wedding_access(wedding_id));
create policy "wedding members can delete checklist"
  on checklist_items for delete using (has_wedding_access(wedding_id));

create policy "wedding members can read shopping"
  on shopping_items for select
  using (has_wedding_access(wedding_id));
create policy "wedding members can write shopping"
  on shopping_items for insert with check (has_wedding_access(wedding_id));
create policy "wedding members can update shopping"
  on shopping_items for update using (has_wedding_access(wedding_id));
create policy "wedding members can delete shopping"
  on shopping_items for delete using (has_wedding_access(wedding_id));

create policy "wedding members can read budget"
  on budget_categories for select
  using (has_wedding_access(wedding_id));
create policy "wedding members can write budget"
  on budget_categories for insert with check (has_wedding_access(wedding_id));
create policy "wedding members can update budget"
  on budget_categories for update using (has_wedding_access(wedding_id));
create policy "wedding members can delete budget"
  on budget_categories for delete using (has_wedding_access(wedding_id));

create policy "wedding members can read guests"
  on guests for select
  using (has_wedding_access(wedding_id));
create policy "wedding members can write guests"
  on guests for insert with check (has_wedding_access(wedding_id));
create policy "wedding members can update guests"
  on guests for update using (has_wedding_access(wedding_id));
create policy "wedding members can delete guests"
  on guests for delete using (has_wedding_access(wedding_id));
