"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/vendors", label: "Vendors" },
];

export default function Nav() {
  const { session, loading } = useSession();
  const pathname = usePathname();

  return (
    <nav className="border-b border-line">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link href="/" className="font-semibold tracking-tight">
          Project&nbsp;M
        </Link>
        <div className="flex items-center gap-5 text-sm flex-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname.startsWith(l.href) ? "text-accent" : "text-foreground/60 hover:text-foreground transition"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
        {!loading &&
          (session ? (
            <Link href="/dashboard" className="text-sm text-foreground/60 hover:text-foreground transition">
              My plans
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition">
              Sign in
            </Link>
          ))}
      </div>
    </nav>
  );
}
