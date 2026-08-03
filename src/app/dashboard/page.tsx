"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";

interface ChecklistRow {
  id: string;
  event: string;
  task: string;
  done: boolean;
}

interface ShoppingRow {
  id: string;
  event: string;
  item: string;
  bought: boolean;
}

interface WeddingRow {
  id: string;
  couple_names: string;
  tradition: string;
  wedding_date: string | null;
  region: string;
  budget_total: number;
}

function DashboardContent() {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const weddingId = searchParams.get("wedding");

  const [wedding, setWedding] = useState<WeddingRow | null>(null);
  const [checklist, setChecklist] = useState<ChecklistRow[]>([]);
  const [shopping, setShopping] = useState<ShoppingRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/login");
      return;
    }
    if (!session) return;

    let cancelled = false;

    (async () => {
      const query = weddingId
        ? supabase.from("weddings").select("*").eq("id", weddingId)
        : supabase
            .from("weddings")
            .select("*")
            .eq("owner_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1);

      const { data: weddingRow } = await query.maybeSingle<WeddingRow>();
      if (cancelled) return;
      setWedding(weddingRow ?? null);

      if (weddingRow) {
        const [{ data: checklistRows }, { data: shoppingRows }] = await Promise.all([
          supabase.from("checklist_items").select("*").eq("wedding_id", weddingRow.id).order("sort_order"),
          supabase.from("shopping_items").select("*").eq("wedding_id", weddingRow.id).order("sort_order"),
        ]);
        if (cancelled) return;
        setChecklist(checklistRows ?? []);
        setShopping(shoppingRows ?? []);
      }
      setFetching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [session, sessionLoading, weddingId, router]);

  async function toggleChecklist(item: ChecklistRow) {
    const { error } = await supabase.from("checklist_items").update({ done: !item.done }).eq("id", item.id);
    if (!error) setChecklist((prev) => prev.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)));
  }

  async function toggleShopping(item: ShoppingRow) {
    const { error } = await supabase.from("shopping_items").update({ bought: !item.bought }).eq("id", item.id);
    if (!error) setShopping((prev) => prev.map((s) => (s.id === item.id ? { ...s, bought: !s.bought } : s)));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (sessionLoading || !session || fetching) return null;

  if (!wedding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/70">No wedding plan yet.</p>
        <Link href="/onboarding" className="rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold">
          Start planning
        </Link>
      </main>
    );
  }

  const checklistDone = checklist.filter((c) => c.done).length;
  const shoppingDone = shopping.filter((s) => s.bought).length;

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto flex flex-col gap-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
            {wedding.tradition} wedding
          </p>
          <h1 className="text-3xl font-semibold mt-1">{wedding.couple_names || "Your plan"}</h1>
          <p className="text-foreground/70 mt-1">
            {wedding.wedding_date || "Date TBD"} · {wedding.region || "Region TBD"} · Budget{" "}
            {wedding.budget_total ? wedding.budget_total.toLocaleString() : "TBD"}
          </p>
        </div>
        <button onClick={handleSignOut} className="text-sm text-foreground/50 hover:text-foreground shrink-0">
          Sign out
        </button>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-1">Checklist</h2>
        <p className="text-sm text-foreground/60 mb-4">
          {checklistDone} / {checklist.length} done
        </p>
        <ul className="flex flex-col gap-2">
          {checklist.map((c) => (
            <li key={c.id}>
              <label className="flex items-start gap-3 bg-surface border border-line rounded-xl px-4 py-3 cursor-pointer">
                <input type="checkbox" checked={c.done} onChange={() => toggleChecklist(c)} className="mt-1" />
                <span>
                  <span className="block text-xs uppercase tracking-wide text-secondary">{c.event}</span>
                  <span className={c.done ? "line-through text-foreground/40" : ""}>{c.task}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Shopping list</h2>
        <p className="text-sm text-foreground/60 mb-4">
          {shoppingDone} / {shopping.length} bought
        </p>
        <ul className="flex flex-col gap-2">
          {shopping.map((s) => (
            <li key={s.id}>
              <label className="flex items-start gap-3 bg-surface border border-line rounded-xl px-4 py-3 cursor-pointer">
                <input type="checkbox" checked={s.bought} onChange={() => toggleShopping(s)} className="mt-1" />
                <span>
                  <span className="block text-xs uppercase tracking-wide text-secondary">{s.event}</span>
                  <span className={s.bought ? "line-through text-foreground/40" : ""}>{s.item}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
