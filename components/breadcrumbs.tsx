// "Home / Electronics / Wireless Earbuds Pro": where you are in the store.
// The last item is the current page, so it isn't a link.

import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} aria-current={isLast ? "page" : undefined}>
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-brand-700">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700">{item.label}</span>
              )}
              {!isLast && <span aria-hidden> / </span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}