-- Allow a signed-in user to add themselves as a collaborator on a wedding
-- they were invited to (via a shareable link containing the wedding id).
-- The wedding_id itself is the invite token — only the owner sees and shares
-- the link. Existing owner-management policy is unaffected; this just adds
-- an additional permissive INSERT path scoped to the invitee's own user_id.

create policy "authenticated users can join as collaborator via invite link"
  on wedding_collaborators for insert
  with check (user_id = auth.uid());
