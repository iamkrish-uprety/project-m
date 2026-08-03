"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { traditions } from "@/data/traditions";
import { TraditionId, WeddingPlan } from "@/lib/types";

export default function Onboarding() {
  const router = useRouter();
  const [coupleNames, setCoupleNames] = useState("");
  const [tradition, setTradition] = useState<TraditionId>("hindu");
  const [weddingDate, setWeddingDate] = useState("");
  const [region, setRegion] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const template = traditions.find((t) => t.id === tradition)!;

    const plan: WeddingPlan = {
      coupleNames,
      tradition,
      weddingDate,
      region,
      budgetTotal: Number(budgetTotal) || 0,
      checklist: template.checklist.map((c) => ({ ...c, done: false })),
      shopping: template.shopping.map((s) => ({ ...s, bought: false })),
    };

    localStorage.setItem("project-m-plan", JSON.stringify(plan));
    router.push("/dashboard");
  }

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

        <button
          type="submit"
          className="mt-2 rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
        >
          Create my plan
        </button>
      </form>
    </main>
  );
}
