"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProfileRow } from "@/lib/db";
import { card, buttonSmall, iconButton, sectionTitle, muted, field } from "./ui";

interface Props {
  weddingId: string;
  ownerId: string;
  currentUserId: string;
}

interface Member {
  userId: string;
  email: string | null;
  isOwner: boolean;
}

export default function ShareSection({ weddingId, ownerId, currentUserId }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [copied, setCopied] = useState(false);
  const isOwner = ownerId === currentUserId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: collabs } = await supabase
        .from("wedding_collaborators")
        .select("user_id")
        .eq("wedding_id", weddingId);

      const ids = Array.from(new Set([ownerId, ...(collabs ?? []).map((c) => c.user_id)]));
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
      if (cancelled) return;

      const byId = new Map((profiles ?? []).map((p: ProfileRow) => [p.id, p.email]));
      setMembers(
        ids.map((id) => ({ userId: id, email: byId.get(id) ?? null, isOwner: id === ownerId }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId, ownerId]);

  const link = typeof window !== "undefined" ? `${window.location.origin}/join?wedding=${weddingId}` : "";

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function removeMember(userId: string) {
    const { error } = await supabase
      .from("wedding_collaborators")
      .delete()
      .eq("wedding_id", weddingId)
      .eq("user_id", userId);
    if (!error) setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }

  return (
    <section>
      <h2 className={sectionTitle}>Who can edit this plan</h2>
      <p className={`${muted} mb-4`}>
        Anyone with the link below can sign in and edit this plan — treat it like a password.
      </p>

      <ul className="flex flex-col gap-2 mb-4">
        {members.map((m) => (
          <li key={m.userId} className={`${card} px-4 py-3 flex items-center gap-3`}>
            <span className="flex-1 min-w-0 truncate">
              {m.email ?? "Unknown user"}
              {m.userId === currentUserId && <span className="text-foreground/50"> (you)</span>}
            </span>
            <span className="text-xs uppercase tracking-wide text-secondary shrink-0">
              {m.isOwner ? "Owner" : "Collaborator"}
            </span>
            {isOwner && !m.isOwner && (
              <button onClick={() => removeMember(m.userId)} className={iconButton} aria-label="Remove collaborator">
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input readOnly value={link} onFocus={(e) => e.target.select()} className={`${field} flex-1 min-w-0`} />
        <button onClick={copy} className={buttonSmall}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </section>
  );
}
