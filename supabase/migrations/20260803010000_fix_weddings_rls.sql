-- Fix: INSERT ... RETURNING on `weddings` failed RLS even for the row's own
-- owner. Root cause: the SELECT policy used has_wedding_access(id), which
-- re-queries `weddings` by id from inside a SECURITY DEFINER function. During
-- an INSERT's RETURNING visibility check, that self-referential lookup on the
-- same table doesn't see the row just inserted by the same command, so the
-- check evaluated false and Postgres reported "new row violates row-level
-- security policy" even though the WITH CHECK for the insert itself passed.
--
-- Fix: `weddings`' own policies compare owner_id directly (no subquery back
-- into weddings), and collaborator access uses a function that only touches
-- wedding_collaborators. has_wedding_access() is left as-is for the child
-- tables (checklist_items, shopping_items, budget_categories, guests), where
-- it looks up a different, already-committed table and isn't affected.

create or replace function is_wedding_collaborator(target_wedding_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from wedding_collaborators c
    where c.wedding_id = target_wedding_id and c.user_id = auth.uid()
  );
$$;

drop policy "owner and collaborators can read weddings" on weddings;
create policy "owner and collaborators can read weddings"
  on weddings for select
  using (owner_id = auth.uid() or is_wedding_collaborator(id));

drop policy "owner and collaborators can update weddings" on weddings;
create policy "owner and collaborators can update weddings"
  on weddings for update
  using (owner_id = auth.uid() or is_wedding_collaborator(id));
