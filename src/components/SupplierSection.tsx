"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SupplierRow } from "@/lib/db";
import {
  CountryDef,
  SUPPLIER_CATEGORIES,
  SUPPLIER_STATUS_LABEL,
  SupplierStatus,
  mapsSearch,
} from "@/data/regions";
import { card, field, buttonSmall, iconButton, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  country: CountryDef;
  place: string;
  rows: SupplierRow[];
  onChange: (rows: SupplierRow[]) => void;
}

const STATUS_CLASS: Record<SupplierStatus, string> = {
  looking: "text-foreground/50",
  shortlisted: "text-accent",
  booked: "text-green-600 dark:text-green-400",
  own: "text-secondary",
};

export default function SupplierSection({ weddingId, country, place, rows, onChange }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(SUPPLIER_CATEGORIES[0]);
  const [searchFor, setSearchFor] = useState<string>(SUPPLIER_CATEGORIES[0]);

  const booked = rows.filter((r) => r.status === "booked" || r.status === "own").length;
  const totalQuoted = rows
    .filter((r) => r.status === "booked")
    .reduce((sum, r) => sum + Number(r.quoted_cost ?? 0), 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from("plan_suppliers")
      .insert({ wedding_id: weddingId, category, name: name.trim(), status: "looking" })
      .select()
      .single<SupplierRow>();
    if (!error && data) {
      onChange([...rows, data]);
      setName("");
    }
  }

  async function patch(row: SupplierRow, patchData: Partial<SupplierRow>) {
    const { error } = await supabase.from("plan_suppliers").update(patchData).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, ...patchData } : r)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("plan_suppliers").delete().eq("id", id);
    if (!error) onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <section>
      <h2 className={sectionTitle}>Suppliers</h2>
      <p className={`${muted} mb-4`}>
        Venue, catering, photography, and everyone else you book rather than buy.
        {rows.length > 0 && ` ${booked} of ${rows.length} sorted`}
        {totalQuoted > 0 && ` · ${totalQuoted.toLocaleString()} quoted`}
      </p>

      <div className={`${card} px-4 py-4 mb-4 flex flex-col gap-3`}>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="flex flex-col gap-1 text-xs text-foreground/60 flex-1 min-w-[9rem]">
            Looking for
            <select value={searchFor} onChange={(e) => setSearchFor(e.target.value)} className={field}>
              {SUPPLIER_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <a
            href={mapsSearch(`wedding ${searchFor}`, place)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded-lg border border-line hover:border-accent transition"
          >
            Search nearby ↗
          </a>
          {country.directories.map((d) => (
            <a
              key={d.name}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              title={d.note}
              className="text-xs px-3 py-2 rounded-lg border border-line hover:border-accent transition"
            >
              {d.name} ↗
            </a>
          ))}
        </div>
        {country.directories.length > 0 && (
          <p className="text-xs text-foreground/50">
            Those directories charge vendors to be listed, so the order they show things in is advertising, not a
            ranking. Worth checking reviews elsewhere before you commit money.
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2 mb-3">
        {rows.map((row) => (
          <li key={row.id} className={`${card} px-4 py-3 flex flex-col gap-2`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase tracking-wide text-secondary shrink-0">{row.category}</span>
              <span className="flex-1 min-w-[8rem] truncate">{row.name}</span>
              <select
                value={row.status}
                onChange={(e) => patch(row, { status: e.target.value as SupplierStatus })}
                className={`border border-line rounded-lg px-2 py-1 bg-transparent text-xs shrink-0 ${
                  STATUS_CLASS[row.status]
                }`}
                aria-label={`Status for ${row.name}`}
              >
                {(Object.keys(SUPPLIER_STATUS_LABEL) as SupplierStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {SUPPLIER_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs text-foreground/60 shrink-0">
                Quote
                <input
                  type="number"
                  min="0"
                  defaultValue={row.quoted_cost}
                  onBlur={(e) => {
                    const n = Number(e.target.value) || 0;
                    if (n !== Number(row.quoted_cost)) patch(row, { quoted_cost: n });
                  }}
                  className="w-24 border border-line rounded-lg px-2 py-1 bg-transparent"
                />
              </label>
              <button onClick={() => remove(row.id)} className={iconButton} aria-label={`Remove ${row.name}`}>
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                defaultValue={row.contact ?? ""}
                onBlur={(e) => {
                  const v = e.target.value.trim() || null;
                  if (v !== row.contact) patch(row, { contact: v });
                }}
                placeholder="Phone or email"
                className={`${field} flex-1 min-w-[8rem] text-xs`}
              />
              <input
                defaultValue={row.url ?? ""}
                onBlur={(e) => {
                  const v = e.target.value.trim() || null;
                  if (v !== row.url) patch(row, { url: v });
                }}
                placeholder="Website or listing link"
                className={`${field} flex-1 min-w-[8rem] text-xs`}
              />
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Supplier name"
          className={`${field} flex-1 min-w-[9rem]`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} w-auto`}>
          {SUPPLIER_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className={buttonSmall}>
          Add
        </button>
      </form>
    </section>
  );
}
