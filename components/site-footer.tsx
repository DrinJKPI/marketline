// The footer on every page. Fully static, so it's prerendered.

import Link from "next/link";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/#deals", label: "Today's deals" },
      { href: "/#new-arrivals", label: "New arrivals" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/cart", label: "Cart" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-slate-900 text-sm text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-base font-bold text-white">Marketline</p>
          <p className="mt-2 max-w-xs">
            Everything you need, in one place: electronics, home, fashion and
            more.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="font-semibold text-white">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-400">
          Marketline is a demo store built for the Tynoc Tech internship. All
          products and brands are made up, and nothing is for sale.
        </p>
      </div>
    </footer>
  );
}