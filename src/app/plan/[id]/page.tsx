"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { findTradition } from "@/data/traditions";
import { resolveTemplate } from "@/lib/types";
import { relativeDay } from "@/lib/dates";
import { BudgetRow, ChecklistRow, GuestRow, ShoppingRow, SupplierRow, WeddingRow } from "@/lib/db";
import { findCountry } from "@/data/regions";
import ChecklistSection from "@/components/ChecklistSection";
import ShoppingSection from "@/components/ShoppingSection";
import SupplierSection from "@/components/SupplierSection";
import BudgetSection from "@/components/BudgetSection";
import GuestSection from "@/components/GuestSection";
import InvitationSection from "@/components/InvitationSection";
import ShareSection from "@/components/ShareSection";
import { buttonGhost, card, muted } from "@/components/ui";

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session, loading } = useSession();
  const router = useRouter();

  const [wedding, setWedding] = useState<WeddingRow | null>(null);
  const [checklist, setChecklist] = useState<ChecklistRow[]>([]);
  const [shopping, setShopping] = useState<ShoppingRow[]>([]);
  const [budget, setBudget] = useState<BudgetRow[]>([]);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [fetching, setFetching] = useState(true);
  // Captured with the data rather than read during render, which would be impure.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(`/plan/${id}`)}`);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data: weddingRow } = await supabase
        .from("weddings")
        .select("*")
        .eq("id", id)
        .maybeSingle<WeddingRow>();
      if (cancelled) return;
      setWedding(weddingRow ?? null);

      if (weddingRow) {
        const [c, s, b, g, sup] = await Promise.all([
          supabase.from("checklist_items").select("*").eq("wedding_id", id).order("sort_order"),
          supabase.from("shopping_items").select("*").eq("wedding_id", id).order("sort_order"),
          supabase.from("budget_categories").select("*").eq("wedding_id", id).order("category"),
          supabase.from("guests").select("*").eq("wedding_id", id).order("name"),
          supabase.from("plan_suppliers").select("*").eq("wedding_id", id).order("created_at"),
        ]);
        if (cancelled) return;
        setChecklist(c.data ?? []);
        setShopping(s.data ?? []);
        setBudget(b.data ?? []);
        setGuests(g.data ?? []);
        setSuppliers(sup.data ?? []);
      }
      setNow(Date.now());
      setFetching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, session, loading, router]);

  if (loading || !session || fetching) return null;

  if (!wedding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className={muted}>This plan doesn&apos;t exist, or you don&apos;t have access to it.</p>
        <Link href="/dashboard" className={buttonGhost}>
          Back to your plans
        </Link>
      </main>
    );
  }

  const template = findTradition(wedding.tradition);
  const resolved = template ? resolveTemplate(template, wedding.tradition_variant) : null;
  const events = resolved?.events ?? [];

  const away = relativeDay(wedding.wedding_date, now);
  const country = findCountry(wedding.country);
  const place = wedding.region;

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Link href="/dashboard" className="text-sm text-foreground/50 hover:text-foreground w-fit">
          ← All plans
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
              {template?.name ?? wedding.tradition} wedding
              {resolved?.variant ? ` · ${resolved.variant.name}` : ""}
            </p>
            <h1 className="text-3xl font-semibold mt-1">{wedding.couple_names || "Your plan"}</h1>
            <p className="text-foreground/70 mt-1">
              {wedding.wedding_date || "Date TBD"}
              {away && ` · ${away}`}
              {" · "}
              {wedding.region || "Region TBD"}
              {country.id !== "other" && `, ${country.name}`}
              {" · "}
              Budget{" "}
              {wedding.budget_total
                ? `${Number(wedding.budget_total).toLocaleString()}${country.currency ? ` ${country.currency}` : ""}`
                : "TBD"}
            </p>
          </div>
          <Link href={`/plan/${id}/settings`} className={buttonGhost}>
            Edit details
          </Link>
        </div>
      </header>

      {template && !template.verified && (
        <p className={`${card} px-4 py-3 ${muted} -mt-4`}>
          The checklist and shopping list below are a draft, not yet confirmed by anyone from this tradition.
          {template.contentNote && <span className="block mt-1">{template.contentNote}</span>}
          {resolved?.variant?.note && <span className="block mt-1">{resolved.variant.note}</span>}
        </p>
      )}

      <ChecklistSection weddingId={id} events={events} rows={checklist} onChange={setChecklist} />
      <ShoppingSection
        weddingId={id}
        events={events}
        country={country}
        place={place}
        rows={shopping}
        onChange={setShopping}
      />
      <SupplierSection
        weddingId={id}
        country={country}
        place={place}
        rows={suppliers}
        onChange={setSuppliers}
      />
      <BudgetSection
        weddingId={id}
        budgetTotal={Number(wedding.budget_total)}
        rows={budget}
        onChange={setBudget}
      />
      <GuestSection weddingId={id} rows={guests} onChange={setGuests} />
      <InvitationSection
        weddingId={id}
        coupleNames={wedding.couple_names}
        weddingDate={wedding.wedding_date}
        place={place}
        message={wedding.invitation_message}
        guests={guests}
        onMessageChange={(m) => setWedding({ ...wedding, invitation_message: m })}
        onGuestsChange={setGuests}
      />
      <ShareSection weddingId={id} ownerId={wedding.owner_id} currentUserId={session.user.id} />
    </main>
  );
}
