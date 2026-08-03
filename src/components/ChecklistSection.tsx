"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChecklistRow } from "@/lib/db";
import { card, field, buttonSmall, iconButton, eyebrow, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  events: string[];
  rows: ChecklistRow[];
  onChange: (rows: ChecklistRow[]) => void;
}

export default function ChecklistSection({ weddingId, events, rows, onChange }: Props) {
  const [task, setTask] = useState("");
  const [event, setEvent] = useState(events[0] ?? "General");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // Events the couple actually has items under, plus any from the template.
  const allEvents = Array.from(new Set([...events, ...rows.map((r) => r.event)]));
  const done = rows.filter((r) => r.done).length;

  async function toggle(row: ChecklistRow) {
    const { error } = await supabase.from("checklist_items").update({ done: !row.done }).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, done: !r.done } : r)));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!task.trim()) return;
    const { data, error } = await supabase
      .from("checklist_items")
      .insert({
        wedding_id: weddingId,
        event: event || "General",
        task: task.trim(),
        due_date: dueDate || null,
        sort_order: rows.length,
      })
      .select()
      .single<ChecklistRow>();
    if (!error && data) {
      onChange([...rows, data]);
      setTask("");
      setDueDate("");
    }
  }

  async function saveEdit(row: ChecklistRow) {
    const next = draft.trim();
    setEditingId(null);
    if (!next || next === row.task) return;
    const { error } = await supabase.from("checklist_items").update({ task: next }).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, task: next } : r)));
  }

  async function setDue(row: ChecklistRow, value: string) {
    const due = value || null;
    const { error } = await supabase.from("checklist_items").update({ due_date: due }).eq("id", row.id);
    if (!error) onChange(rows.map((r) => (r.id === row.id ? { ...r, due_date: due } : r)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("checklist_items").delete().eq("id", id);
    if (!error) onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <section>
      <h2 className={sectionTitle}>Checklist</h2>
      <p className={`${muted} mb-4`}>
        {done} / {rows.length} done
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
                  <li key={row.id} className={`${card} px-4 py-3 flex items-start gap-3`}>
                    <input
                      type="checkbox"
                      checked={row.done}
                      onChange={() => toggle(row)}
                      className="mt-1 shrink-0"
                      aria-label={row.task}
                    />
                    <div className="flex-1 min-w-0">
                      {editingId === row.id ? (
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={() => saveEdit(row)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(row);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className={field}
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(row.id);
                            setDraft(row.task);
                          }}
                          className={`text-left w-full ${row.done ? "line-through text-foreground/40" : ""}`}
                        >
                          {row.task}
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={row.due_date ?? ""}
                      onChange={(e) => setDue(row, e.target.value)}
                      className="border border-line rounded-lg px-2 py-1 bg-transparent text-xs text-foreground/70 shrink-0"
                      aria-label={`Due date for ${row.task}`}
                    />
                    <button onClick={() => remove(row.id)} className={iconButton} aria-label={`Remove ${row.task}`}>
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
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a task"
          className={`${field} flex-1 min-w-[10rem]`}
        />
        <select value={event} onChange={(e) => setEvent(e.target.value)} className={`${field} w-auto`}>
          {allEvents.map((ev) => (
            <option key={ev}>{ev}</option>
          ))}
          <option>General</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`${field} w-auto`}
          aria-label="Due date"
        />
        <button type="submit" className={buttonSmall}>
          Add
        </button>
      </form>
    </section>
  );
}
