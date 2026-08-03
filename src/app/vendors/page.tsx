"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { traditions } from "@/data/traditions";
import { VendorRow, VENDOR_CATEGORIES } from "@/lib/db";
import { card, field, buttonPrimary, buttonGhost, muted, eyebrow } from "@/components/ui";

export default function VendorsPage() {
  const { session } = useSession();
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [category, setCategory] = useState("");
  const [tradition, setTradition] = useState("");
  const [region, setRegion] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // RLS returns published listings, plus the viewer's own pending ones.
      const { data } = await supabase.from("vendors").select("*").order("name");
      if (cancelled) return;
      setVendors(data ?? []);
      setFetching(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = vendors.filter(
    (v) =>
      (!category || v.category === category) &&
      (!tradition || v.traditions.includes(tradition)) &&
      (!region || v.region.toLowerCase().includes(region.toLowerCase()))
  );
  const published = filtered.filter((v) => v.published);
  const mine = filtered.filter((v) => !v.published);

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Vendors</p>
        <h1 className="text-3xl font-semibold mt-1">Find people who know your traditions</h1>
        <p className="text-foreground/70 mt-2 max-w-xl">
          Clothing shops, jewellers, caterers, decorators, photographers, and officiants — filtered by the
          tradition they actually work with.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} w-auto`}>
          <option value="">All categories</option>
          {VENDOR_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={tradition} onChange={(e) => setTradition(e.target.value)} className={`${field} w-auto`}>
          <option value="">All traditions</option>
          {traditions
            .filter((t) => t.available)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="City or region"
          className={`${field} w-auto flex-1 min-w-[8rem]`}
        />
      </div>

      {fetching ? null : published.length === 0 ? (
        <div className={`${card} px-6 py-10 text-center flex flex-col items-center gap-3`}>
          <p className="font-semibold">No vendors listed yet</p>
          <p className={`${muted} max-w-md`}>
            The directory is empty on purpose — every listing here has to be a real business someone has
            checked, not a placeholder. If you know a good one, add them below.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {published.map((v) => (
            <li key={v.id} className={`${card} px-5 py-4`}>
              <p className={eyebrow}>{v.category}</p>
              <p className="text-lg font-semibold mt-0.5">{v.name}</p>
              {v.region && <p className={muted}>{v.region}</p>}
              {v.description && <p className="text-sm text-foreground/70 mt-2">{v.description}</p>}
              <div className="flex gap-4 mt-3 text-sm flex-wrap">
                {v.website && (
                  <a
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-accent hover:underline"
                  >
                    Website
                  </a>
                )}
                {v.contact_email && (
                  <a href={`mailto:${v.contact_email}`} className="text-accent hover:underline">
                    Email
                  </a>
                )}
                {v.contact_phone && <span className="text-foreground/60">{v.contact_phone}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {mine.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2">Your submissions</h2>
          <ul className="flex flex-col gap-2">
            {mine.map((v) => (
              <li key={v.id} className={`${card} px-5 py-3 flex items-center gap-3`}>
                <span className="flex-1 min-w-0 truncate">{v.name}</span>
                <span className="text-xs uppercase tracking-wide text-foreground/50 shrink-0">
                  Awaiting review
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-line pt-8">
        {showForm ? (
          <SubmitVendorForm
            onDone={(vendor) => {
              setVendors((prev) => [...prev, vendor]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-xl font-semibold">Know a vendor worth listing?</h2>
            <p className="text-foreground/70">
              Submissions are reviewed before they appear publicly, so please only add businesses you&apos;ve
              actually dealt with.
            </p>
            {session ? (
              <button onClick={() => setShowForm(true)} className={buttonPrimary}>
                Suggest a vendor
              </button>
            ) : (
              <Link href="/login?next=%2Fvendors" className={buttonPrimary}>
                Sign in to suggest a vendor
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function SubmitVendorForm({
  onDone,
  onCancel,
}: {
  onDone: (vendor: VendorRow) => void;
  onCancel: () => void;
}) {
  const { session } = useSession();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(VENDOR_CATEGORIES[0]);
  const [servesTraditions, setServesTraditions] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTradition(id: string) {
    setServesTraditions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from("vendors")
      .insert({
        name: name.trim(),
        category,
        traditions: servesTraditions,
        region: region.trim(),
        description: description.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        website: website.trim() || null,
        submitted_by: session.user.id,
        published: false,
      })
      .select()
      .single<VendorRow>();

    setSubmitting(false);
    if (error) setError(error.message);
    else if (data) onDone(data);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Suggest a vendor</h2>

      <label className="flex flex-col gap-1 text-sm">
        Business name
        <input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          {VENDOR_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1">Traditions they work with</legend>
        <div className="flex flex-wrap gap-2">
          {traditions
            .filter((t) => t.available)
            .map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => toggleTradition(t.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  servesTraditions.includes(t.id)
                    ? "border-accent text-accent"
                    : "border-line text-foreground/60 hover:border-accent"
                }`}
              >
                {t.name}
              </button>
            ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        City / region
        <input required value={region} onChange={(e) => setRegion(e.target.value)} className={field} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        What are they good at?
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={field}
          placeholder="A sentence or two from your own experience"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <label className="flex flex-col gap-1 text-sm flex-1 min-w-[10rem]">
          Contact email
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm flex-1 min-w-[10rem]">
          Phone
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Website
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={field}
          placeholder="https://"
        />
      </label>

      <p className="text-xs text-foreground/50">
        This goes to a review queue rather than straight onto the site, so nobody sees an unchecked listing.
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className={buttonPrimary}>
          {submitting ? "Submitting…" : "Submit for review"}
        </button>
        <button type="button" onClick={onCancel} className={buttonGhost}>
          Cancel
        </button>
      </div>
    </form>
  );
}
