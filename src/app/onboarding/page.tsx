"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { traditions } from "@/data/traditions";
import { TraditionId } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";

export default function Onboarding() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [coupleNames, setCoupleNames] = useState("");
  const [tradition, setTradition] = useState<TraditionId>("hindu");
  const [weddingDate, setWeddingDate] = useState("");
  const [region, setRegion] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);

    const template = traditions.find((t) => t.id === tradition)!;

    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .insert({
        owner_id: session.user.id,
        couple_names: coupleNames,
        tradition,
        wedding_date: weddingDate || null,
        region,
        budget_total: Number(budgetTotal) || 0,
      })
      .select()
      .single();

    if (weddingError || !wedding) {
      setError(weddingError?.message ?? "Could not create your plan.");
      setSubmitting(false);
      return;
    }

    const { error: checklistError } = await supabase.from("checklist_items").insert(
      template.checklist.map((c, i) => ({
        wedding_id: wedding.id,
        event: c.event,
        task: c.task,
        sort_order: i,
      }))
    );
    const { error: shoppingError } = await supabase.from("shopping_items").insert(
      template.shopping.map((s, i) => ({
        wedding_id: wedding.id,
        event: s.event,
        item: s.item,
        sort_order: i,
      }))
    );

    if (checklistError || shoppingError) {
      setError(checklistError?.message ?? shoppingError?.message ?? "Could not seed your checklist.");
      setSubmitting(false);
      return;
    }

    router.push(`/dashboard?wedding=${wedding.id}`);
  }

  if (loading || !session) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-5 bg-surface border border-line rounded-2xl p-8"
      >
        <h1 className="text-2xl font-semibold">Tell us about your wedding</h1>

        <label className="flex flex-col gap-1 text-sm">
          Couple&apos;s names
          <input
            required
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 bg-transparent"
            placeholder="e.g. Aashma & Daniel"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tradition
          <select
            value={tradition}
            onChange={(e) => setTradition(e.target.value as TraditionId)}
            className="border border-line rounded-lg px-3 py-2 bg-transparent"
          >
            {traditions.map((t) => (
              <option key={t.id} value={t.id} disabled={!t.available}>
                {t.name}
                {!t.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Wedding date
          <input
            type="date"
            required
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Region / city
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 bg-transparent"
            placeholder="e.g. Kathmandu"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Rough budget
          <input
            type="number"
            min="0"
            value={budgetTotal}
            onChange={(e) => setBudgetTotal(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 bg-transparent"
            placeholder="e.g. 500000"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create my plan"}
        </button>
      </form>
    </main>
  );
}
