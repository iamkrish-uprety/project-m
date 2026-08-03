"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { traditions } from "@/data/traditions";
import { COUNTRIES, CountryId } from "@/data/regions";
import { TraditionId, resolveTemplate } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { buttonPrimary, field, muted } from "@/components/ui";

export default function Onboarding() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [coupleNames, setCoupleNames] = useState("");
  const [tradition, setTradition] = useState<TraditionId>("hindu");
  const [variant, setVariant] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState<CountryId>("np");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) router.replace("/login?next=%2Fonboarding");
  }, [loading, session, router]);

  const template = traditions.find((t) => t.id === tradition)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);

    const resolved = resolveTemplate(template, variant || null);

    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .insert({
        owner_id: session.user.id,
        couple_names: coupleNames,
        tradition,
        tradition_variant: variant || null,
        wedding_date: weddingDate || null,
        region,
        country,
        budget_total: Number(budgetTotal) || 0,
      })
      .select()
      .single();

    if (weddingError || !wedding) {
      setError(weddingError?.message ?? "Could not create your plan.");
      setSubmitting(false);
      return;
    }

    const [{ error: checklistError }, { error: shoppingError }] = await Promise.all([
      supabase.from("checklist_items").insert(
        resolved.checklist.map((c, i) => ({
          wedding_id: wedding.id,
          event: c.event,
          task: c.task,
          sort_order: i,
        }))
      ),
      supabase.from("shopping_items").insert(
        resolved.shopping.map((s, i) => ({
          wedding_id: wedding.id,
          event: s.event,
          item: s.item,
          sort_order: i,
        }))
      ),
    ]);

    if (checklistError || shoppingError) {
      setError(checklistError?.message ?? shoppingError?.message ?? "Could not seed your checklist.");
      setSubmitting(false);
      return;
    }

    router.push(`/plan/${wedding.id}`);
  }

  if (loading || !session) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-5 bg-surface border border-line rounded-2xl p-8"
      >
        <div>
          <h1 className="text-2xl font-semibold">Tell us about your wedding</h1>
          <p className={`${muted} mt-1`}>
            We&apos;ll build a starting checklist and shopping list you can edit however you like.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Couple&apos;s names
          <input
            required
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
            className={field}
            placeholder="e.g. Aashma & Daniel"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tradition
          <select
            value={tradition}
            onChange={(e) => {
              setTradition(e.target.value as TraditionId);
              setVariant("");
            }}
            className={field}
          >
            {traditions.map((t) => (
              <option key={t.id} value={t.id} disabled={!t.available}>
                {t.name}
                {!t.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </label>

        {template.variants && template.variants.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
            Regional variant <span className="text-foreground/50">(optional)</span>
            <select value={variant} onChange={(e) => setVariant(e.target.value)} className={field}>
              <option value="">Not sure / none</option>
              {template.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.where ? ` — ${v.where}` : ""}
                </option>
              ))}
            </select>
            {variant && (
              <span className="text-xs text-foreground/50">
                {template.variants.find((v) => v.id === variant)?.note}
              </span>
            )}
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Wedding date
          <input
            type="date"
            required
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className={field}
          />
        </label>

        <div className="flex gap-2 flex-wrap">
          <label className="flex flex-col gap-1 text-sm flex-1 min-w-[9rem]">
            City
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={field}
              placeholder="e.g. Kathmandu"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm flex-1 min-w-[9rem]">
            Country
            <select value={country} onChange={(e) => setCountry(e.target.value as CountryId)} className={field}>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-foreground/50 -mt-3">
          We use these to search for shops and suppliers near you — nothing is shared with anyone.
        </p>

        <label className="flex flex-col gap-1 text-sm">
          Rough budget
          <input
            type="number"
            min="0"
            value={budgetTotal}
            onChange={(e) => setBudgetTotal(e.target.value)}
            className={field}
            placeholder="e.g. 500000"
          />
        </label>

        {!template.verified && (
          <p className="text-xs text-foreground/50">
            Heads up: our {template.name} checklist is a draft that hasn&apos;t been reviewed by anyone from the
            tradition yet. Everything on it is editable.
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={submitting} className={buttonPrimary}>
          {submitting ? "Creating…" : "Create my plan"}
        </button>

        <Link href="/dashboard" className="text-sm text-foreground/50 hover:text-foreground text-center">
          Back to your plans
        </Link>
      </form>
    </main>
  );
}
