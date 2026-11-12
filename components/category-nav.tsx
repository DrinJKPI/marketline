// The bar of category links under the header. It reads the categories from
// the database, so the header shows it inside <Suspense>.

import Link from "next/link";
import { getCategories } from "@/server/services/catalog";

const linkClass =
  "block whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-700 hover:text-brand-700";

export async function CategoryNav() {
  const categories = await getCategories();

  return (
    <nav aria-label="Categories" className="border-b border-slate-200 bg-white">
      <ul className="mx-auto flex h-11 max-w-7xl items-center overflow-x-auto px-2 sm:px-4">
        <li>
          <Link href="/products" className={linkClass}>
            All products
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/categories/${category.slug}`} className={linkClass}>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}