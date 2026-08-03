"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { findTradition } from "@/data/traditions";
import { WeddingRow } from "@/lib/db";
import { buttonPrimary, buttonGhost, field, muted } from "@/components/ui";

export default function PlanSettings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session, loading } = useSession();
  const router = useRouter();

  const [wedding, setWedding] = useState<WeddingRow | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [coupleNames, setCoupleNames] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [region, setRegion] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [variant, setVariant] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(`/plan/${id}/settings`)}`);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("weddings").select("*").eq("id", id).maybeSingle<WeddingRow>();
      if (cancelled) return;
      if (data) {
        setWedding(data);
        setCoupleNames(data.couple_names);
        setWeddingDate(data.wedding_date ?? "");
        setRegion(data.region);
        setBudgetTotal(String(data.budget_total ?? ""));
        setVariant(data.tradition_variant ?? "");
      }
      setFetching(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, session, loading, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("weddings")
      .update({
        couple_names: coupleNames,
        wedding_date: weddingDate || null,
        region,
        budget_total: Number(budgetTotal) || 0,
        tradition_variant: variant || null,
      })
      .eq("id", id);
    setSaving(false);
    if (error) setError(error.message);
    else router.push(`/plan/${id}`);
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("weddings").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setDeleting(false);
    } else {
      router.replace("/dashboard");
    }
  }

  if (loading || !session || fetching) return null;

  if (!wedding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className={muted}>This plan doesn&apos;t exist, or you don&apos;t have access to it.</p>
        <Link href="/dashboard" className={buttonGhost}>
          Back to your plans
        </Link>
      </main>
    );
  }

  const template = findTradition(wedding.tradition);
  const isOwner = wedding.owner_id === session.user.id;

  return (
    <main className="min-h-screen px-6 py-12 max-w-lg mx-auto flex flex-col gap-6">
      <Link href={`/plan/${id}`} className="text-sm text-foreground/50 hover:text-foreground w-fit">
        ← Back to plan
      </Link>
      <h1 className="text-2xl font-semibold">Plan details</h1>

      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Couple&apos;s names
          <input value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} className={field} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tradition
          <input
            readOnly
            value={template?.name ?? wedding.tradition}
            className={`${field} text-foreground/50`}
            title="The tradition can't be changed — start a new plan instead, so your existing checklist isn't overwritten."
          />
          <span className="text-xs text-foreground/50">
            Can&apos;t be changed here — start a new plan instead, so your current checklist isn&apos;t lost.
          </span>
        </label>

        {template?.variants && template.variants.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
            Regional variant
            <select value={variant} onChange={(e) => setVariant(e.target.value)} className={field}>
              <option value="">None</option>
              {template.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-foreground/50">
              Changing this updates the suggested events shown when adding items. It won&apos;t add or remove
              anything already on your list.
            </span>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Wedding date
          <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className={field} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Region / city
          <input value={region} onChange={(e) => setRegion(e.target.value)} className={field} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Total budget
          <input
            type="number"
            min="0"
            value={budgetTotal}
            onChange={(e) => setBudgetTotal(e.target.value)}
            className={field}
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {isOwner && (
        <div className="border-t border-line pt-6 mt-2">
          <h2 className="text-sm font-semibold mb-1">Delete this plan</h2>
          <p className={`${muted} mb-3`}>
            Permanently removes the plan and everything in it — checklist, shopping list, budget, and guests. This
            can&apos;t be undone.
          </p>
          {confirmDelete ? (
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm">Delete {wedding.couple_names || "this plan"}?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} className={buttonGhost}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-500 hover:underline">
              Delete plan
            </button>
          )}
        </div>
      )}
    </main>
  );
}
