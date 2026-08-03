import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { traditions } from "@/data/traditions";

export function generateStaticParams() {
  return traditions.filter((t) => t.available).map((t) => ({ tradition: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tradition: string }>;
}): Promise<Metadata> {
  const { tradition } = await params;
  const t = traditions.find((x) => x.id === tradition && x.available);
  if (!t) return {};
  return {
    title: `${t.name} wedding checklist and shopping list — Project M`,
    description:
      t.blurb ??
      `What happens at each ceremony in a ${t.name} wedding, and what you need to buy for it.`,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ tradition: string }> }) {
  const { tradition } = await params;
  const t = traditions.find((x) => x.id === tradition && x.available);
  if (!t) notFound();

  const events = Array.from(new Set([...t.events, ...t.checklist.map((c) => c.event)]));

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto flex flex-col gap-10">
      <header>
        <Link href="/guides" className="text-sm text-foreground/50 hover:text-foreground">
          ← All guides
        </Link>
        <h1 className="text-3xl font-semibold mt-3">{t.name} wedding checklist</h1>
        {t.blurb && <p className="text-foreground/70 mt-2 max-w-xl">{t.blurb}</p>}
      </header>

      <div className="bg-surface border border-line rounded-xl px-4 py-3 text-sm text-foreground/60">
        This guide is a draft, not reviewed by anyone from this tradition.
        {t.contentNote && <span className="block mt-1">{t.contentNote}</span>}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">The ceremonies</h2>
        <div className="flex flex-col gap-6">
          {events.map((ev) => {
            const tasks = t.checklist.filter((c) => c.event === ev);
            const buys = t.shopping.filter((s) => s.event === ev);
            if (tasks.length === 0 && buys.length === 0) return null;
            return (
              <div key={ev} className="bg-surface border border-line rounded-xl px-5 py-4">
                <h3 className="font-semibold">{ev}</h3>
                {tasks.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wide text-secondary font-semibold mt-3 mb-1">
                      To arrange
                    </p>
                    <ul className="list-disc pl-5 text-sm text-foreground/70 flex flex-col gap-1">
                      {tasks.map((task) => (
                        <li key={task.id}>{task.task}</li>
                      ))}
                    </ul>
                  </>
                )}
                {buys.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wide text-secondary font-semibold mt-3 mb-1">
                      To buy
                    </p>
                    <ul className="list-disc pl-5 text-sm text-foreground/70 flex flex-col gap-1">
                      {buys.map((buy) => (
                        <li key={buy.id}>{buy.item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {t.variants && t.variants.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Regional variations</h2>
          <div className="flex flex-col gap-4">
            {t.variants.map((v) => (
              <div key={v.id} className="bg-surface border border-line rounded-xl px-5 py-4">
                <h3 className="font-semibold">{v.name}</h3>
                {v.where && (
                  <p className="text-xs uppercase tracking-wide text-secondary font-semibold mt-0.5">{v.where}</p>
                )}
                {v.note && <p className="text-sm text-foreground/60 mt-1">{v.note}</p>}
                {(v.addChecklist?.length || v.addShopping?.length) && (
                  <ul className="list-disc pl-5 text-sm text-foreground/70 flex flex-col gap-1 mt-3">
                    {v.addChecklist?.map((c) => (
                      <li key={c.id}>
                        <span className="text-secondary">{c.event}:</span> {c.task}
                      </li>
                    ))}
                    {v.addShopping?.map((s) => (
                      <li key={s.id}>
                        <span className="text-secondary">{s.event}:</span> {s.item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line pt-8 flex flex-col items-start gap-3">
        <h2 className="text-xl font-semibold">Track this as your own plan</h2>
        <p className="text-foreground/70">
          Start a plan and this checklist becomes yours — editable, shareable with family, with a budget and guest
          list attached.
        </p>
        <Link
          href="/onboarding"
          className="rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
        >
          Start planning
        </Link>
      </section>
    </main>
  );
}
