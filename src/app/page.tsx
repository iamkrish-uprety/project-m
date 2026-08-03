import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Project M</p>
      <h1 className="text-3xl sm:text-4xl font-semibold max-w-xl text-balance">
        One planner, every wedding tradition
      </h1>
      <p className="max-w-md text-foreground/70">
        Pick your tradition — Hindu, Christian, and more coming soon — and get a checklist,
        shopping list, and budget built for your ceremony.
      </p>
      <Link
        href="/onboarding"
        className="mt-2 rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
      >
        Start planning
      </Link>
    </main>
  );
}
