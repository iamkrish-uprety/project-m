import type { Metadata } from "next";
import Link from "next/link";
import { traditions } from "@/data/traditions";

export const metadata: Metadata = {
  title: "Wedding planning guides by tradition — Project M",
  description:
    "Checklists and shopping lists for Hindu, Christian, Muslim, Sikh, and Buddhist weddings — what happens at each ceremony and what you need to buy.",
};

export default function GuidesIndex() {
  const available = traditions.filter((t) => t.available);

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Guides</p>
        <h1 className="text-3xl font-semibold mt-1">Wedding planning by tradition</h1>
        <p className="text-foreground/70 mt-2 max-w-xl">
          What happens at each ceremony, and what you need to buy for it. Pick your tradition to see the full
          checklist — then start a plan to track it.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {available.map((t) => (
          <li key={t.id}>
            <Link
              href={`/guides/${t.id}`}
              className="bg-surface border border-line rounded-xl px-5 py-4 flex items-center gap-4 hover:border-accent transition"
            >
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold">{t.name} wedding</p>
                <p className="text-sm text-foreground/60">
                  {t.events.length} ceremonies · {t.checklist.length} tasks · {t.shopping.length} things to buy
                </p>
              </div>
              <span className="text-foreground/30 shrink-0">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-foreground/50 border-t border-line pt-6">
        These guides are drafts assembled from general research. None have been reviewed by someone from the
        tradition they describe, and regional customs vary a lot — treat them as a starting point, not an
        authority.
      </p>
    </main>
  );
}
