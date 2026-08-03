"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { findTradition } from "@/data/traditions";
import { relativeDay } from "@/lib/dates";
import { WeddingRow } from "@/lib/db";
import { card, buttonPrimary, muted } from "@/components/ui";

export default function Dashboard() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [weddings, setWeddings] = useState<WeddingRow[]>([]);
  const [fetching, setFetching] = useState(true);
  // Captured with the data rather than read during render, which would be impure.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login?next=%2Fdashboard");
      return;
    }
    let cancelled = false;
    (async () => {
      // RLS already limits this to plans the user owns or collaborates on.
      const { data } = await supabase.from("weddings").select("*").order("created_at", { ascending: false });
      if (cancelled) return;
      setWeddings(data ?? []);
      setNow(Date.now());
      setFetching(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, loading, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading || !session || fetching) return null;

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your plans</h1>
          <p className={`${muted} mt-1`}>{session.user.email}</p>
        </div>
        <button onClick={signOut} className="text-sm text-foreground/50 hover:text-foreground shrink-0">
          Sign out
        </button>
      </header>

      {weddings.length === 0 ? (
        <div className={`${card} px-6 py-10 flex flex-col items-center gap-4 text-center`}>
          <p className={muted}>You don&apos;t have any wedding plans yet.</p>
          <Link href="/onboarding" className={buttonPrimary}>
            Start planning
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {weddings.map((w) => {
              const template = findTradition(w.tradition);
              const owned = w.owner_id === session.user.id;
              const away = relativeDay(w.wedding_date, now);
              return (
                <li key={w.id}>
                  <Link
                    href={`/plan/${w.id}`}
                    className={`${card} px-5 py-4 flex items-center gap-4 hover:border-accent transition`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-secondary font-semibold">
                        {template?.name ?? w.tradition}
                        {!owned && " · shared with you"}
                      </p>
                      <p className="text-lg font-semibold truncate mt-0.5">{w.couple_names || "Untitled plan"}</p>
                      <p className={muted}>
                        {w.wedding_date ?? "Date TBD"}
                        {away && ` · ${away}`}
                        {w.region && ` · ${w.region}`}
                      </p>
                    </div>
                    <span className="text-foreground/30 shrink-0">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/onboarding" className={`${buttonPrimary} w-fit`}>
            Start another plan
          </Link>
        </>
      )}
    </main>
  );
}
