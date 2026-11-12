// A category link on the homepage: its icon, name and short description.

import Link from "next/link";
import { getCategoryVisual } from "@/lib/product-visuals";
import type { Category } from "@/types/catalog";

export function CategoryTile({ category }: { category: Category }) {
  const visual = getCategoryVisual(category.slug);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex h-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-md"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${visual.className}`}
      >
        <visual.icon aria-hidden className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium group-hover:text-brand-700">
          {category.name}
        </span>
        <span className="line-clamp-1 text-xs text-slate-500">
          {category.description}
        </span>
      </span>
    </Link>
  );
}