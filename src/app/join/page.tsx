"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";

function JoinContent() {
  const { session, loading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const weddingId = searchParams.get("wedding");

  const [status, setStatus] = useState<"idle" | "joining" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!weddingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setError("This invite link is missing a wedding.");
      return;
    }

    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(`/join?wedding=${weddingId}`)}`);
      return;
    }

    if (status !== "idle") return;
    setStatus("joining");

    (async () => {
      const { error } = await supabase
        .from("wedding_collaborators")
        .insert({ wedding_id: weddingId, user_id: session.user.id });

      // 23505 = already a collaborator — treat as success, not an error.
      if (error && error.code !== "23505") {
        setStatus("error");
        setError(error.message);
        return;
      }

      router.replace(`/dashboard?wedding=${weddingId}`);
    })();
  }, [loading, session, weddingId, router, status]);

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/dashboard" className="text-sm text-foreground/60 hover:text-foreground">
          Go to your dashboard
        </Link>
      </main>
    );
  }

  return null;
}

export default function Join() {
  return (
    <Suspense fallback={null}>
      <JoinContent />
    </Suspense>
  );
}
