"use client";

import { useState } from "react";

interface Props {
  /** Average of everyone's ratings, or null when nobody has rated yet. */
  average: number | null;
  count: number;
  /** This viewer's own rating, if they've left one. */
  mine?: number | null;
  onRate?: (rating: number) => void;
}

export default function StarRating({ average, count, mine, onRate }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = Boolean(onRate);
  // While hovering, preview that rating; otherwise show yours, else the average.
  const shown = hover ?? mine ?? average ?? 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= Math.round(shown);
          const star = (
            <span className={filled ? "text-accent" : "text-line"} aria-hidden="true">
              ★
            </span>
          );
          if (!interactive) return <span key={n}>{star}</span>;
          return (
            <button
              key={n}
              onClick={() => onRate?.(n)}
              onMouseEnter={() => setHover(n)}
              className="leading-none hover:scale-110 transition-transform"
              aria-label={`Rate ${n} out of 5`}
            >
              {star}
            </button>
          );
        })}
      </div>
      <span className="text-xs text-foreground/50">
        {count === 0
          ? interactive
            ? "Be the first to rate"
            : "No ratings yet"
          : `${average?.toFixed(1)} · ${count} rating${count === 1 ? "" : "s"}`}
        {mine ? " · yours saved" : ""}
      </span>
    </div>
  );
}
