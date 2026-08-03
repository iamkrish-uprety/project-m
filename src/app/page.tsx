import Link from "next/link";
import { traditions } from "@/data/traditions";

const FEATURES = [
  {
    title: "A checklist that matches your ceremonies",
    body: "Not one generic timeline. Your plan is built from the events your tradition actually has — and everything on it is editable.",
  },
  {
    title: "Know what to buy, for which day",
    body: "Attire, jewellery, and everything else, grouped by the ceremony it's for, with cost estimates as you go.",
  },
  {
    title: "Budget and guests in the same place",
    body: "Track spend per category and RSVPs per guest, instead of scattering it across spreadsheets.",
  },
  {
    title: "Plan it with your family",
    body: "Share one link and a partner or family coordinator can edit the same plan with you.",
  },
];

export default function Home() {
  const available = traditions.filter((t) => t.available);

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-20 pb-16 max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
        <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
          Hindu · Christian · Muslim · Sikh · Buddhist
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold max-w-2xl text-balance leading-tight">
          One planner, every wedding tradition
        </h1>
        <p className="max-w-lg text-foreground/70 text-lg">
          Most wedding apps assume one kind of wedding. Pick your tradition and get a checklist, shopping list,
          budget, and guest list built around your ceremonies.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <Link
            href="/onboarding"
            className="rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
          >
            Start planning
          </Link>
          <Link href="/guides" className="rounded-full border border-line px-6 py-3 text-sm hover:border-accent transition">
            Browse the guides
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-surface border border-line rounded-xl px-5 py-5">
            <h2 className="font-semibold">{f.title}</h2>
            <p className="text-sm text-foreground/70 mt-1.5">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Start from your tradition</h2>
        <div className="flex flex-wrap gap-2">
          {available.map((t) => (
            <Link
              key={t.id}
              href={`/guides/${t.id}`}
              className="border border-line rounded-full px-4 py-2 text-sm hover:border-accent transition"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <p className="text-sm text-foreground/50 mt-6 max-w-xl">
          Our tradition content is an early draft that hasn&apos;t been reviewed by people from each community
          yet, so treat it as a starting point you edit — not an authority. Interfaith and civil weddings are
          still to come.
        </p>
      </section>
    </main>
  );
}
