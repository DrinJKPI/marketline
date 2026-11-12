// Homepage: a welcome banner (static), then categories and product sections
// loaded from the database.

import Link from "next/link";
import { Suspense } from "react";
import { CategoryTile } from "@/components/category-tile";
import { ProductGrid } from "@/components/product-grid";
import { HeadingSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { getHomepageData } from "@/server/services/catalog";
import type { Product } from "@/types/catalog";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
        <Suspense fallback={<HomepageSkeleton />}>
          <HomepageSections />
        </Suspense>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-r from-brand-900 to-brand-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-20">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          Everything you need, in one place
        </h1>
        <p className="mt-4 max-w-xl text-lg text-brand-100">
          Electronics, home, fashion, toys and more, from brands you&apos;ll
          love.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#deals"
            className="rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-300"
          >
            Shop today&apos;s deals
          </a>
          <Link
            href="/products"
            className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Browse all products
          </Link>
        </div>
      </div>
    </section>
  );
}

async function HomepageSections() {
  const { categories, deals, featured, newArrivals } = await getHomepageData();

  return (
    <>
      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight">
          Shop by category
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryTile category={category} />
            </li>
          ))}
        </ul>
      </section>

      <ProductSection id="deals" title="Today's deals" products={deals} />
      <ProductSection id="featured" title="Featured products" products={featured} />
      <ProductSection id="new-arrivals" title="New arrivals" products={newArrivals} />
    </>
  );
}

function ProductSection({
  id,
  title,
  products,
}: {
  id: string;
  title: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <Link href="/products" className="text-sm font-medium text-brand-700 hover:underline">
          See all
        </Link>
      </div>
      <div className="mt-5">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

function HomepageSkeleton() {
  return (
    <>
      <HeadingSkeleton />
      <ProductGridSkeleton count={4} />
      <HeadingSkeleton />
      <ProductGridSkeleton count={8} />
    </>
  );
}