"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WeddingPlan } from "@/lib/types";

export default function Dashboard() {
  const [plan, setPlan] = useState<WeddingPlan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("project-m-plan");
    // One-time hydration from localStorage: this can't run during SSR, so it
    // has to happen in an effect rather than a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (raw) setPlan(JSON.parse(raw));
    setLoaded(true);
  }, []);

  function persist(next: WeddingPlan) {
    setPlan(next);
    localStorage.setItem("project-m-plan", JSON.stringify(next));
  }

  function toggleChecklist(id: string) {
    if (!plan) return;
    persist({
      ...plan,
      checklist: plan.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    });
  }

  function toggleShopping(id: string) {
    if (!plan) return;
    persist({
      ...plan,
      shopping: plan.shopping.map((s) => (s.id === id ? { ...s, bought: !s.bought } : s)),
    });
  }

  if (!loaded) return null;

  if (!plan) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/70">No wedding plan yet.</p>
        <Link href="/onboarding" className="rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold">
          Start planning
        </Link>
      </main>
    );
  }

  const checklistDone = plan.checklist.filter((c) => c.done).length;
  const shoppingDone = plan.shopping.filter((s) => s.bought).length;

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto flex flex-col gap-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
          {plan.tradition} wedding
        </p>
        <h1 className="text-3xl font-semibold mt-1">{plan.coupleNames || "Your plan"}</h1>
        <p className="text-foreground/70 mt-1">
          {plan.weddingDate || "Date TBD"} · {plan.region || "Region TBD"} · Budget{" "}
          {plan.budgetTotal ? plan.budgetTotal.toLocaleString() : "TBD"}
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-1">Checklist</h2>
        <p className="text-sm text-foreground/60 mb-4">
          {checklistDone} / {plan.checklist.length} done
        </p>
        <ul className="flex flex-col gap-2">
          {plan.checklist.map((c) => (
            <li key={c.id}>
              <label className="flex items-start gap-3 bg-surface border border-line rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={() => toggleChecklist(c.id)}
                  className="mt-1"
                />
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
          {shoppingDone} / {plan.shopping.length} bought
        </p>
        <ul className="flex flex-col gap-2">
          {plan.shopping.map((s) => (
            <li key={s.id}>
              <label className="flex items-start gap-3 bg-surface border border-line rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.bought}
                  onChange={() => toggleShopping(s.id)}
                  className="mt-1"
                />
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
