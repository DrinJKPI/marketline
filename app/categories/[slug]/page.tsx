// A category page, e.g. /categories/electronics: the category's name and
// all of its products. An unknown slug shows the 404 page.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { ProductGrid } from "@/components/product-grid";
import { HeadingSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { getCategoryVisual } from "@/lib/product-visuals";
import { getCategoryPageData } from "@/server/services/catalog";

// generateMetadata and the page both need the category. cache() makes them
// share one database read per request instead of reading it twice.
const loadCategory = cache(getCategoryPageData);

export async function generateMetadata({
    params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const data = await loadCategory(slug);
    if (!data) return { title: "Category not found" };
    return { title: data.category.name, description: data.category.description };
}

export default function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <Suspense
                fallback={
                    <div className="space-y-8">
                        <HeadingSkeleton />
                        <ProductGridSkeleton />
                    </div>
                }
            >
                <CategoryContent params={params} />
            </Suspense>
        </div>
    );
}

async function CategoryContent({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await loadCategory(slug);
    if (!data) notFound();

    const { category, products } = data;
    const visual = getCategoryVisual(category.slug);

    return (
        <>
            <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
                <ol className="flex flex-wrap gap-1">
                    <li>
                        <Link href="/" className="hover:text-brand-700">
                            Home
                        </Link>
                        <span aria-hidden> / </span>
                    </li>
                    <li aria-current="page" className="text-slate-700">
                        {category.name}
                    </li>
                </ol>
            </nav>

            <div className="mt-4 flex items-center gap-4">
                <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${visual.className}`}
                >
                    <visual.icon aria-hidden className="h-7 w-7" />
                </span>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                    <p className="mt-1 text-slate-600">{category.description}</p>
                </div>
            </div>

            <p className="mt-8 text-sm text-slate-500">
                {products.length} {products.length === 1 ? "product" : "products"}
            </p>
            <div className="mt-3">
                {products.length > 0 ? (
                    <ProductGrid products={products} />
                ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                        There are no products in this category yet.
                    </p>
                )}
            </div>
        </>
    );
}