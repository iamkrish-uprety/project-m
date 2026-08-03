"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/onboarding";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    });

    setSubmitting(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="max-w-sm text-foreground/70">
          Check <span className="text-foreground">{email}</span> for a sign-in link.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 bg-surface border border-line rounded-2xl p-8"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-foreground/70">We&apos;ll email you a link — no password needed.</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border border-line rounded-lg px-3 py-2 bg-transparent"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send magic link"}
        </button>
      </form>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
