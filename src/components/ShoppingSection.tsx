"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingRow } from "@/lib/db";
import { card, field, buttonSmall, iconButton, eyebrow, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  events: string[];
  rows: ShoppingRow[];
  onChange: (rows: ShoppingRow[]) => void;
}

export default function ShoppingSection({ weddingId, events, rows, onChange }: Props) {
  const [item, setItem] = useState("");
  const [event, setEvent] = useState(events[0] ?? "General");
  const [cost, setCost] = useState("");

  const allEvents = Array.from(new Set([...events, ...rows.map((r) => r.event)]));
  const bought = rows.filter((r) => r.bought).length;
  const estimated = rows.reduce((sum, r) => sum + Number(r.estimated_cost ?? 0), 0);
  const spentSoFar = rows.filter((r) => r.bought).reduce((sum, r) => sum + Number(r.estimated_cost ?? 0), 0);

  async function toggle(row: ShoppingRow) {
    const { error } = await supabase.from("shopping_items").update({ bought: !row.bought }).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, bought: !r.bought } : r)));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim()) return;
    const { data, error } = await supabase
      .from("shopping_items")
      .insert({
        wedding_id: weddingId,
        event: event || "General",
        item: item.trim(),
        estimated_cost: Number(cost) || 0,
        sort_order: rows.length,
      })
      .select()
      .single<ShoppingRow>();
    if (!error && data) {
      onChange([...rows, data]);
      setItem("");
      setCost("");
    }
  }

  async function setEstimate(row: ShoppingRow, value: string) {
    const numeric = Number(value) || 0;
    if (numeric === Number(row.estimated_cost)) return;
    const { error } = await supabase.from("shopping_items").update({ estimated_cost: numeric }).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, estimated_cost: numeric } : r)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("shopping_items").delete().eq("id", id);
    if (!error) onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <section>
      <h2 className={sectionTitle}>Shopping list</h2>
      <p className={`${muted} mb-4`}>
        {bought} / {rows.length} bought
        {estimated > 0 && (
          <>
            {" · "}
            {spentSoFar.toLocaleString()} of {estimated.toLocaleString()} estimated
          </>
        )}
      </p>

      <div className="flex flex-col gap-5 mb-4">
        {allEvents.map((ev) => {
          const items = rows.filter((r) => r.event === ev);
          if (items.length === 0) return null;
          return (
            <div key={ev}>
              <p className={`${eyebrow} mb-2`}>{ev}</p>
              <ul className="flex flex-col gap-2">
                {items.map((row) => (
                  <li key={row.id} className={`${card} px-4 py-3 flex items-center gap-3`}>
                    <input
                      type="checkbox"
                      checked={row.bought}
                      onChange={() => toggle(row)}
                      className="shrink-0"
                      aria-label={row.item}
                    />
                    <span className={`flex-1 min-w-0 ${row.bought ? "line-through text-foreground/40" : ""}`}>
                      {row.item}
                    </span>
                    <label className="flex items-center gap-1 text-xs text-foreground/60 shrink-0">
                      Est.
                      <input
                        type="number"
                        min="0"
                        defaultValue={row.estimated_cost}
                        onBlur={(e) => setEstimate(row, e.target.value)}
                        className="w-24 border border-line rounded-lg px-2 py-1 bg-transparent"
                      />
                    </label>
                    <button onClick={() => remove(row.id)} className={iconButton} aria-label={`Remove ${row.item}`}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Add an item"
          className={`${field} flex-1 min-w-[10rem]`}
        />
        <select value={event} onChange={(e) => setEvent(e.target.value)} className={`${field} w-auto`}>
          {allEvents.map((ev) => (
            <option key={ev}>{ev}</option>
          ))}
          <option>General</option>
        </select>
        <input
          type="number"
          min="0"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Est. cost"
          className={`${field} w-28`}
        />
        <button type="submit" className={buttonSmall}>
          Add
        </button>
      </form>
    </section>
  );
}
