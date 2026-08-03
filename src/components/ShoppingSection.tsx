"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingRow } from "@/lib/db";
import { CountryDef, mapsSearch } from "@/data/regions";
import { card, field, buttonSmall, buttonGhost, iconButton, eyebrow, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  events: string[];
  country: CountryDef;
  place: string;
  rows: ShoppingRow[];
  onChange: (rows: ShoppingRow[]) => void;
}

export default function ShoppingSection({ weddingId, events, country, place, rows, onChange }: Props) {
  const [item, setItem] = useState("");
  const [event, setEvent] = useState(events[0] ?? "General");
  const [cost, setCost] = useState("");
  const [openFinder, setOpenFinder] = useState<string | null>(null);

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

  async function patch(row: ShoppingRow, patchData: Partial<ShoppingRow>) {
    const { error } = await supabase.from("shopping_items").update(patchData).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, ...patchData } : r)));
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
                  <li key={row.id} className={`${card} px-4 py-3 flex flex-col gap-2`}>
                    <div className="flex items-center gap-3">
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
                      <button
                        onClick={() => setOpenFinder(openFinder === row.id ? null : row.id)}
                        className="text-xs text-accent hover:underline shrink-0"
                      >
                        {row.source_name ? row.source_name : "Where to find it"}
                      </button>
                      <label className="flex items-center gap-1 text-xs text-foreground/60 shrink-0">
                        Est.
                        <input
                          type="number"
                          min="0"
                          defaultValue={row.estimated_cost}
                          onBlur={(e) => {
                            const n = Number(e.target.value) || 0;
                            if (n !== Number(row.estimated_cost)) patch(row, { estimated_cost: n });
                          }}
                          className="w-24 border border-line rounded-lg px-2 py-1 bg-transparent"
                        />
                      </label>
                      <button onClick={() => remove(row.id)} className={iconButton} aria-label={`Remove ${row.item}`}>
                        ✕
                      </button>
                    </div>

                    {openFinder === row.id && (
                      <ItemFinder
                        row={row}
                        country={country}
                        place={place}
                        onSave={(name, url) => {
                          patch(row, { source_name: name || null, source_url: url || null });
                          setOpenFinder(null);
                        }}
                      />
                    )}

                    {openFinder !== row.id && row.source_url && (
                      <a
                        href={row.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-foreground/50 hover:text-accent truncate"
                      >
                        {row.source_url}
                      </a>
                    )}
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

function ItemFinder({
  row,
  country,
  place,
  onSave,
}: {
  row: ShoppingRow;
  country: CountryDef;
  place: string;
  onSave: (name: string, url: string) => void;
}) {
  const [name, setName] = useState(row.source_name ?? "");
  const [url, setUrl] = useState(row.source_url ?? "");

  return (
    <div className="border-t border-line pt-3 flex flex-col gap-3">
      <div>
        <p className="text-xs text-foreground/60 mb-2">
          Search for &ldquo;{row.item}&rdquo;
          {place && ` around ${place}`}:
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={mapsSearch(row.item, place)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-accent transition"
          >
            Shops nearby ↗
          </a>
          {country.shops.map((s) => (
            <a
              key={s.name}
              href={s.url(row.item, place)}
              target="_blank"
              rel="noopener noreferrer"
              title={s.note}
              className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-accent transition"
            >
              {s.name} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="flex flex-col gap-1 text-xs text-foreground/60 flex-1 min-w-[8rem]">
          Found somewhere? Save it
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Shop name"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60 flex-1 min-w-[8rem]">
          Link (optional)
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className={field} />
        </label>
        <button onClick={() => onSave(name.trim(), url.trim())} className={buttonGhost}>
          Save
        </button>
      </div>
    </div>
  );
}
