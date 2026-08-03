"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BudgetRow } from "@/lib/db";
import { card, field, buttonSmall, iconButton, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  budgetTotal: number;
  rows: BudgetRow[];
  onChange: (rows: BudgetRow[]) => void;
}

const SUGGESTED = ["Venue", "Catering", "Attire", "Jewellery", "Decor", "Photography", "Music", "Transport"];

export default function BudgetSection({ weddingId, budgetTotal, rows, onChange }: Props) {
  const [category, setCategory] = useState("");
  const [allocated, setAllocated] = useState("");

  const totalAllocated = rows.reduce((sum, r) => sum + Number(r.allocated), 0);
  const totalSpent = rows.reduce((sum, r) => sum + Number(r.spent), 0);
  const unallocated = budgetTotal - totalAllocated;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!category.trim()) return;
    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        wedding_id: weddingId,
        category: category.trim(),
        allocated: Number(allocated) || 0,
        spent: 0,
      })
      .select()
      .single<BudgetRow>();
    if (!error && data) {
      onChange([...rows, data].sort((a, b) => a.category.localeCompare(b.category)));
      setCategory("");
      setAllocated("");
    }
  }

  async function updateField(row: BudgetRow, key: "allocated" | "spent", value: string) {
    const numeric = Number(value) || 0;
    if (numeric === Number(row[key])) return;
    const { error } = await supabase.from("budget_categories").update({ [key]: numeric }).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, [key]: numeric } : r)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("budget_categories").delete().eq("id", id);
    if (!error) onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <section>
      <h2 className={sectionTitle}>Budget</h2>
      <p className={`${muted} mb-4`}>
        {totalSpent.toLocaleString()} spent of {totalAllocated.toLocaleString()} allocated
        {budgetTotal > 0 && (
          <>
            {" · "}
            {unallocated >= 0
              ? `${unallocated.toLocaleString()} of ${budgetTotal.toLocaleString()} left to allocate`
              : `${Math.abs(unallocated).toLocaleString()} over the ${budgetTotal.toLocaleString()} budget`}
          </>
        )}
      </p>

      <ul className="flex flex-col gap-2 mb-3">
        {rows.map((row) => {
          const over = Number(row.spent) > Number(row.allocated);
          const pct =
            Number(row.allocated) > 0
              ? Math.min(100, (Number(row.spent) / Number(row.allocated)) * 100)
              : 0;
          return (
            <li key={row.id} className={`${card} px-4 py-3 flex flex-col gap-2`}>
              <div className="flex items-center gap-3">
                <span className="flex-1 min-w-0 truncate">{row.category}</span>
                <label className="flex items-center gap-1 text-xs text-foreground/60">
                  Allocated
                  <input
                    type="number"
                    min="0"
                    defaultValue={row.allocated}
                    onBlur={(e) => updateField(row, "allocated", e.target.value)}
                    className="w-24 border border-line rounded-lg px-2 py-1 bg-transparent"
                  />
                </label>
                <label className="flex items-center gap-1 text-xs text-foreground/60">
                  Spent
                  <input
                    type="number"
                    min="0"
                    defaultValue={row.spent}
                    onBlur={(e) => updateField(row, "spent", e.target.value)}
                    className={`w-24 border rounded-lg px-2 py-1 bg-transparent ${
                      over ? "border-red-500 text-red-500" : "border-line"
                    }`}
                  />
                </label>
                <button onClick={() => remove(row.id)} className={iconButton} aria-label={`Remove ${row.category}`}>
                  ✕
                </button>
              </div>
              <div className="h-1 rounded-full bg-line overflow-hidden">
                <div
                  className={`h-full rounded-full ${over ? "bg-red-500" : "bg-accent"}`}
                  style={{ width: `${over ? 100 : pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          list="budget-suggestions"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Catering"
          className={`${field} flex-1 min-w-[10rem]`}
        />
        <datalist id="budget-suggestions">
          {SUGGESTED.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <input
          type="number"
          min="0"
          value={allocated}
          onChange={(e) => setAllocated(e.target.value)}
          placeholder="Allocated"
          className={`${field} w-32`}
        />
        <button type="submit" className={buttonSmall}>
          Add
        </button>
      </form>
    </section>
  );
}
