// A friendly "nothing here" box: an icon, a title, a short explanation and
// a button. Used for an empty wishlist, the 404 page and the error page.

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: { href: string; label: string };
  children?: React.ReactNode; // anything extra, e.g. a second button
};

export function EmptyState({ icon: Icon, title, text, action, children }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <Icon aria-hidden className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-3 text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {action && (
          <Link
            href={action.href}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
          >
            {action.label}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}