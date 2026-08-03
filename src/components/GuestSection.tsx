"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GuestRow, Rsvp } from "@/lib/db";
import { card, field, buttonSmall, iconButton, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  rows: GuestRow[];
  onChange: (rows: GuestRow[]) => void;
}

const RSVP_LABEL: Record<Rsvp, string> = { pending: "Pending", yes: "Coming", no: "Can't come" };
const RSVP_CLASS: Record<Rsvp, string> = {
  pending: "text-foreground/50",
  yes: "text-green-600 dark:text-green-400",
  no: "text-red-500",
};

export default function GuestSection({ weddingId, rows, onChange }: Props) {
  const [name, setName] = useState("");
  const [side, setSide] = useState("Both");
  const [contact, setContact] = useState("");
  const [filter, setFilter] = useState<"all" | Rsvp>("all");

  const visible = filter === "all" ? rows : rows.filter((r) => r.rsvp === filter);
  const yes = rows.filter((r) => r.rsvp === "yes");
  const headcount = yes.reduce((sum, r) => sum + 1 + Number(r.plus_ones ?? 0), 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const looksLikeEmail = contact.includes("@");
    const { data, error } = await supabase
      .from("guests")
      .insert({
        wedding_id: weddingId,
        name: name.trim(),
        side,
        invited: false,
        rsvp: "pending",
        email: looksLikeEmail ? contact.trim() || null : null,
        phone: !looksLikeEmail ? contact.trim() || null : null,
      })
      .select()
      .single<GuestRow>();
    if (!error && data) {
      onChange([...rows, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setContact("");
    }
  }

  async function patch(row: GuestRow, patchData: Partial<GuestRow>) {
    const { error } = await supabase.from("guests").update(patchData).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, ...patchData } : r)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (!error) onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <section>
      <h2 className={sectionTitle}>Guests</h2>
      <p className={`${muted} mb-4`}>
        {rows.filter((r) => r.invited).length} of {rows.length} invited · {headcount} confirmed attending
        {yes.some((r) => r.plus_ones > 0) && " (incl. plus-ones)"}
      </p>

      {rows.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["all", "pending", "yes", "no"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                filter === f ? "border-accent text-accent" : "border-line text-foreground/60 hover:border-accent"
              }`}
            >
              {f === "all" ? `All (${rows.length})` : `${RSVP_LABEL[f]} (${rows.filter((r) => r.rsvp === f).length})`}
            </button>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-2 mb-3">
        {visible.map((row) => (
          <li key={row.id} className={`${card} px-4 py-3 flex items-center gap-3 flex-wrap`}>
            <label className="flex items-center gap-2 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={row.invited}
                onChange={() => patch(row, { invited: !row.invited })}
                aria-label={`Invited: ${row.name}`}
              />
              <span className="text-xs text-foreground/50">Invited</span>
            </label>

            <div className="flex-1 min-w-[8rem]">
              <span className="block truncate">{row.name}</span>
              {(row.email || row.phone) && (
                <span className="block text-xs text-foreground/50 truncate">{row.email ?? row.phone}</span>
              )}
            </div>

            {row.side && <span className="text-xs uppercase tracking-wide text-secondary shrink-0">{row.side}</span>}

            <select
              value={row.rsvp}
              onChange={(e) => patch(row, { rsvp: e.target.value as Rsvp })}
              className={`border border-line rounded-lg px-2 py-1 bg-transparent text-xs shrink-0 ${RSVP_CLASS[row.rsvp]}`}
              aria-label={`RSVP for ${row.name}`}
            >
              <option value="pending">Pending</option>
              <option value="yes">Coming</option>
              <option value="no">Can&apos;t come</option>
            </select>

            <label className="flex items-center gap-1 text-xs text-foreground/60 shrink-0">
              +
              <input
                type="number"
                min="0"
                defaultValue={row.plus_ones}
                onBlur={(e) => {
                  const n = Number(e.target.value) || 0;
                  if (n !== row.plus_ones) patch(row, { plus_ones: n });
                }}
                className="w-14 border border-line rounded-lg px-2 py-1 bg-transparent"
                aria-label={`Plus-ones for ${row.name}`}
              />
            </label>

            <button onClick={() => remove(row.id)} className={iconButton} aria-label={`Remove ${row.name}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest name"
          className={`${field} flex-1 min-w-[9rem]`}
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone (optional)"
          className={`${field} flex-1 min-w-[9rem]`}
        />
        <select value={side} onChange={(e) => setSide(e.target.value)} className={`${field} w-auto`}>
          <option>Bride</option>
          <option>Groom</option>
          <option>Both</option>
        </select>
        <button type="submit" className={buttonSmall}>
          Add
        </button>
      </form>
    </section>
  );
}
