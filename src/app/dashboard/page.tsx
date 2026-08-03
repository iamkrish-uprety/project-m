"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { traditions } from "@/data/traditions";

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

interface BudgetRow {
  id: string;
  category: string;
  allocated: number;
  spent: number;
}

interface GuestRow {
  id: string;
  name: string;
  side: string | null;
  invited: boolean;
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
  const [budget, setBudget] = useState<BudgetRow[]>([]);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [fetching, setFetching] = useState(true);

  const [newCategory, setNewCategory] = useState("");
  const [newAllocated, setNewAllocated] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestSide, setNewGuestSide] = useState("Both");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session) {
      const next = weddingId ? `/dashboard?wedding=${weddingId}` : "/dashboard";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
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
        const [{ data: checklistRows }, { data: shoppingRows }, { data: budgetRows }, { data: guestRows }] =
          await Promise.all([
            supabase.from("checklist_items").select("*").eq("wedding_id", weddingRow.id).order("sort_order"),
            supabase.from("shopping_items").select("*").eq("wedding_id", weddingRow.id).order("sort_order"),
            supabase.from("budget_categories").select("*").eq("wedding_id", weddingRow.id).order("category"),
            supabase.from("guests").select("*").eq("wedding_id", weddingRow.id).order("name"),
          ]);
        if (cancelled) return;
        setChecklist(checklistRows ?? []);
        setShopping(shoppingRows ?? []);
        setBudget(budgetRows ?? []);
        setGuests(guestRows ?? []);
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

  async function addBudgetCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding || !newCategory.trim()) return;
    const { data, error } = await supabase
      .from("budget_categories")
      .insert({ wedding_id: wedding.id, category: newCategory.trim(), allocated: Number(newAllocated) || 0, spent: 0 })
      .select()
      .single<BudgetRow>();
    if (!error && data) {
      setBudget((prev) => [...prev, data].sort((a, b) => a.category.localeCompare(b.category)));
      setNewCategory("");
      setNewAllocated("");
    }
  }

  async function updateBudgetField(row: BudgetRow, field: "allocated" | "spent", value: string) {
    const numeric = Number(value) || 0;
    const { error } = await supabase.from("budget_categories").update({ [field]: numeric }).eq("id", row.id);
    if (!error) setBudget((prev) => prev.map((b) => (b.id === row.id ? { ...b, [field]: numeric } : b)));
  }

  async function removeBudgetCategory(id: string) {
    const { error } = await supabase.from("budget_categories").delete().eq("id", id);
    if (!error) setBudget((prev) => prev.filter((b) => b.id !== id));
  }

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding || !newGuestName.trim()) return;
    const { data, error } = await supabase
      .from("guests")
      .insert({ wedding_id: wedding.id, name: newGuestName.trim(), side: newGuestSide, invited: false })
      .select()
      .single<GuestRow>();
    if (!error && data) {
      setGuests((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGuestName("");
    }
  }

  async function toggleGuestInvited(guest: GuestRow) {
    const { error } = await supabase.from("guests").update({ invited: !guest.invited }).eq("id", guest.id);
    if (!error) setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, invited: !g.invited } : g)));
  }

  async function removeGuest(id: string) {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (!error) setGuests((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function copyJoinLink() {
    if (!wedding) return;
    const link = `${window.location.origin}/join?wedding=${wedding.id}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
  const totalAllocated = budget.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budget.reduce((sum, b) => sum + b.spent, 0);
  const invitedCount = guests.filter((g) => g.invited).length;
  const template = traditions.find((t) => t.id === wedding.tradition);

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

      {template && !template.verified && (
        <p className="text-sm text-foreground/60 bg-surface border border-line rounded-xl px-4 py-3 -mt-4">
          The checklist and shopping list below are a draft, not yet confirmed by anyone from this
          tradition.
          {template.contentNote && <span className="block mt-1">{template.contentNote}</span>}
        </p>
      )}

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

      <section>
        <h2 className="text-xl font-semibold mb-1">Budget</h2>
        <p className="text-sm text-foreground/60 mb-4">
          {totalSpent.toLocaleString()} spent of {totalAllocated.toLocaleString()} allocated
          {wedding.budget_total ? ` · budget ${wedding.budget_total.toLocaleString()}` : ""}
        </p>
        <ul className="flex flex-col gap-2 mb-3">
          {budget.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-3"
            >
              <span className="flex-1 min-w-0 truncate">{b.category}</span>
              <label className="flex items-center gap-1 text-xs text-foreground/60">
                Allocated
                <input
                  type="number"
                  min="0"
                  defaultValue={b.allocated}
                  onBlur={(e) => updateBudgetField(b, "allocated", e.target.value)}
                  className="w-24 border border-line rounded-lg px-2 py-1 bg-transparent"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-foreground/60">
                Spent
                <input
                  type="number"
                  min="0"
                  defaultValue={b.spent}
                  onBlur={(e) => updateBudgetField(b, "spent", e.target.value)}
                  className={`w-24 border rounded-lg px-2 py-1 bg-transparent ${
                    b.spent > b.allocated ? "border-red-500 text-red-500" : "border-line"
                  }`}
                />
              </label>
              <button
                onClick={() => removeBudgetCategory(b.id)}
                className="text-foreground/40 hover:text-red-500 text-sm shrink-0"
                aria-label={`Remove ${b.category}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addBudgetCategory} className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Catering"
            className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 bg-transparent text-sm"
          />
          <input
            type="number"
            min="0"
            value={newAllocated}
            onChange={(e) => setNewAllocated(e.target.value)}
            placeholder="Allocated"
            className="w-28 border border-line rounded-lg px-3 py-2 bg-transparent text-sm"
          />
          <button type="submit" className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold shrink-0">
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Guests</h2>
        <p className="text-sm text-foreground/60 mb-4">
          {invitedCount} / {guests.length} invited
        </p>
        <ul className="flex flex-col gap-2 mb-3">
          {guests.map((g) => (
            <li key={g.id} className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-3">
              <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                <input type="checkbox" checked={g.invited} onChange={() => toggleGuestInvited(g)} />
                <span className={`truncate ${g.invited ? "text-foreground" : "text-foreground/70"}`}>{g.name}</span>
                {g.side && (
                  <span className="text-xs uppercase tracking-wide text-secondary shrink-0">{g.side}</span>
                )}
              </label>
              <button
                onClick={() => removeGuest(g.id)}
                className="text-foreground/40 hover:text-red-500 text-sm shrink-0"
                aria-label={`Remove ${g.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addGuest} className="flex gap-2">
          <input
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            placeholder="Guest name"
            className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 bg-transparent text-sm"
          />
          <select
            value={newGuestSide}
            onChange={(e) => setNewGuestSide(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 bg-transparent text-sm"
          >
            <option>Bride</option>
            <option>Groom</option>
            <option>Both</option>
          </select>
          <button type="submit" className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold shrink-0">
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Share this plan</h2>
        <p className="text-sm text-foreground/60 mb-4">
          Send this link to a partner or family coordinator — they&apos;ll sign in and get full edit access.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/join?wedding=${wedding.id}`}
            className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 bg-transparent text-sm text-foreground/70"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={copyJoinLink}
            className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold shrink-0"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
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
