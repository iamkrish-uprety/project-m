"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GuestRow } from "@/lib/db";
import { card, field, buttonSmall, buttonGhost, sectionTitle, muted } from "./ui";

interface Props {
  weddingId: string;
  coupleNames: string;
  weddingDate: string | null;
  place: string;
  message: string | null;
  guests: GuestRow[];
  onMessageChange: (message: string) => void;
  onGuestsChange: (rows: GuestRow[]) => void;
}

function defaultMessage(coupleNames: string, weddingDate: string | null, place: string) {
  const who = coupleNames || "We";
  const when = weddingDate ? ` on ${weddingDate}` : "";
  const where = place ? ` in ${place}` : "";
  return `${who} are getting married${when}${where}. We'd love for you to be there — please let us know if you can make it.`;
}

/** wa.me needs digits only, including country code. */
function waNumber(phone: string) {
  return phone.replace(/\D/g, "");
}

export default function InvitationSection({
  weddingId,
  coupleNames,
  weddingDate,
  place,
  message,
  guests,
  onMessageChange,
  onGuestsChange,
}: Props) {
  const fallback = defaultMessage(coupleNames, weddingDate, place);
  const [draft, setDraft] = useState(message ?? fallback);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = (message ?? fallback).trim();
  const withPhone = guests.filter((g) => g.phone);
  const withEmail = guests.filter((g) => g.email);
  const notInvited = guests.filter((g) => !g.invited);

  async function saveMessage() {
    const { error } = await supabase
      .from("weddings")
      .update({ invitation_message: draft })
      .eq("id", weddingId);
    if (!error) {
      onMessageChange(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function markInvited(guest: GuestRow) {
    if (guest.invited) return;
    const { error } = await supabase.from("guests").update({ invited: true }).eq("id", guest.id);
    if (!error) onGuestsChange(guests.map((g) => (g.id === guest.id ? { ...g, invited: true } : g)));
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section>
      <h2 className={sectionTitle}>Invitations</h2>
      <p className={`${muted} mb-4`}>
        {notInvited.length === 0 && guests.length > 0
          ? "Everyone on your guest list has been invited."
          : `${notInvited.length} of ${guests.length} still to invite.`}
      </p>

      <div className={`${card} px-4 py-4 mb-4 flex flex-col gap-3`}>
        <label className="flex flex-col gap-1 text-sm">
          Your invitation message
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className={field}
          />
        </label>
        <div className="flex gap-2 flex-wrap">
          <button onClick={saveMessage} className={buttonSmall}>
            {saved ? "Saved" : "Save message"}
          </button>
          <button onClick={copyMessage} className={buttonGhost}>
            {copied ? "Copied!" : "Copy message"}
          </button>
        </div>
        <p className="text-xs text-foreground/50">
          Sending opens WhatsApp or your email app with this message ready to go — nothing is sent on your behalf,
          so you can change it per person before hitting send.
        </p>
      </div>

      {guests.length === 0 ? (
        <p className={muted}>Add some guests first and they&apos;ll show up here.</p>
      ) : (
        <ul className="flex flex-col gap-2 mb-4">
          {guests.map((g) => {
            const wa = g.phone ? `https://wa.me/${waNumber(g.phone)}?text=${encodeURIComponent(text)}` : null;
            const mail = g.email
              ? `mailto:${g.email}?subject=${encodeURIComponent(
                  `${coupleNames || "Our"} wedding`
                )}&body=${encodeURIComponent(text)}`
              : null;
            return (
              <li key={g.id} className={`${card} px-4 py-3 flex items-center gap-3 flex-wrap`}>
                <div className="flex-1 min-w-[8rem]">
                  <span className="block truncate">{g.name}</span>
                  <span className="block text-xs text-foreground/50 truncate">
                    {g.phone ?? g.email ?? "No contact details"}
                  </span>
                </div>
                {g.invited && <span className="text-xs text-green-600 dark:text-green-400 shrink-0">Invited</span>}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markInvited(g)}
                    className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-accent transition shrink-0"
                  >
                    WhatsApp ↗
                  </a>
                )}
                {mail && (
                  <a
                    href={mail}
                    onClick={() => markInvited(g)}
                    className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-accent transition shrink-0"
                  >
                    Email ↗
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className={`${card} px-4 py-3`}>
        <p className="text-sm font-semibold">Printed cards — coming soon</p>
        <p className={`${muted} mt-1`}>
          Posting physical invitations needs a print-and-mail partner, which isn&apos;t set up yet. For now, export
          your guest list addresses and take them to a local printer.
        </p>
        <p className="text-xs text-foreground/50 mt-2">
          {withPhone.length} {withPhone.length === 1 ? "guest has" : "guests have"} a phone number,{" "}
          {withEmail.length} {withEmail.length === 1 ? "has" : "have"} an email.
        </p>
      </div>
    </section>
  );
}
