// Star rating, e.g. ★★★★☆ (1,284). Partial stars work by drawing five grey
// stars with five yellow ones on top, cut off at the right width.

import { Star } from "lucide-react";

const count = new Intl.NumberFormat("en-IE");

function Stars({ className }: { className: string }) {
  return (
    <span className="flex w-max">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 shrink-0 ${className}`} />
      ))}
    </span>
  );
}

export function Rating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="sr-only">
        Rated {rating} out of 5, from {count.format(reviewCount)} reviews
      </span>
      <span aria-hidden className="relative">
        <Stars className="fill-slate-200 text-slate-200" />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${(rating / 5) * 100}%` }}
        >
          <Stars className="fill-amber-400 text-amber-400" />
        </span>
      </span>
      <span aria-hidden className="text-slate-500">
        ({count.format(reviewCount)})
      </span>
    </div>
  );
}