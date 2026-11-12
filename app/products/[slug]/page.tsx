// A product page, e.g. /products/wireless-earbuds-pro: picture, price,
// stock, description and details, followed by related products.
// An unknown slug shows the 404 page.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Price } from "@/components/price";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
import { Rating } from "@/components/rating";
import { HeadingSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { discountPercent, formatPrice } from "@/lib/utils/money";
import { getProductPageData } from "@/server/services/catalog";
import type { Product } from "@/types/catalog";

const LOW_STOCK = 5;

// One database read per request, shared by generateMetadata and the page.
const loadProduct = cache(getProductPageData);

export async function generateMetadata({
    params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const data = await loadProduct(slug);
    if (!data) return { title: "Product not found" };
    return { title: data.product.name, description: data.product.description };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <Suspense fallback={<ProductPageSkeleton />}>
                <ProductContent params={params} />
            </Suspense>
        </div>
    );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await loadProduct(slug);
    if (!data) notFound();

    const { product, category, related } = data;
    const discount = discountPercent(product.priceCents, product.compareAtPriceCents);

    return (
        <>
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    ...(category
                        ? [{ label: category.name, href: `/categories/${category.slug}` }]
                        : []),
                    { label: product.name },
                ]}
            />

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <ProductImage product={product} sizes="(min-width: 1024px) 50vw, 100vw" />
                </div>

                <div>
                    <Link
                        href={`/products?brand=${encodeURIComponent(product.brand)}`}
                        className="text-sm font-semibold uppercase tracking-wide text-brand-700 hover:underline"
                    >
                        {product.brand}
                    </Link>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
                    <div className="mt-2">
                        <Rating rating={product.rating} reviewCount={product.reviewCount} />
                    </div>

                    <div className="mt-6">
                        <Price
                            priceCents={product.priceCents}
                            compareAtPriceCents={product.compareAtPriceCents}
                            large
                        />
                        {discount && product.compareAtPriceCents ? (
                            <p className="mt-1 text-sm font-medium text-red-600">
                                You save {formatPrice(product.compareAtPriceCents - product.priceCents)} (
                                {discount}%)
                            </p>
                        ) : null}
                    </div>

                    <StockStatus stock={product.stock} />

                    {/* The "Add to cart" and wishlist buttons come here on Days 6 and 7. */}

                    <p className="mt-6 leading-relaxed text-slate-700">{product.description}</p>

                    <dl className="mt-6 grid grid-cols-[8rem_1fr] gap-y-2 border-t border-slate-200 pt-6 text-sm">
                        <dt className="text-slate-500">Brand</dt>
                        <dd>{product.brand}</dd>
                        {category && (
                            <>
                                <dt className="text-slate-500">Category</dt>
                                <dd>
                                    <Link href={`/categories/${category.slug}`} className="text-brand-700 hover:underline">
                                        {category.name}
                                    </Link>
                                </dd>
                            </>
                        )}
                        <dt className="text-slate-500">Item code</dt>
                        <dd className="font-mono text-xs leading-5">{product.slug}</dd>
                    </dl>

                    {product.tags.length > 0 && <RelatedSearches product={product} />}
                </div>
            </div>

            {related.length > 0 && (
                <section aria-labelledby="related-heading" className="mt-16">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 id="related-heading" className="text-2xl font-bold tracking-tight">
                            You might also like
                        </h2>
                        {category && (
                            <Link
                                href={`/categories/${category.slug}`}
                                className="text-sm font-medium text-brand-700 hover:underline"
                            >
                                More in {category.name}
                            </Link>
                        )}
                    </div>
                    <div className="mt-5">
                        <ProductGrid products={related} />
                    </div>
                </section>
            )}
        </>
    );
}

function StockStatus({ stock }: { stock: number }) {
    if (stock === 0) {
        return (
            <p className="mt-4 flex items-center gap-2 font-medium text-red-600">
                <CircleX aria-hidden className="h-5 w-5" /> Out of stock
            </p>
        );
    }
    if (stock <= LOW_STOCK) {
        return (
            <p className="mt-4 flex items-center gap-2 font-medium text-amber-700">
                <TriangleAlert aria-hidden className="h-5 w-5" /> Only {stock} left in stock
            </p>
        );
    }
    return (
        <p className="mt-4 flex items-center gap-2 font-medium text-emerald-700">
            <CircleCheck aria-hidden className="h-5 w-5" /> In stock
        </p>
    );
}

// The product's tags as quick links to a search, e.g. "bluetooth".
function RelatedSearches({ product }: { product: Product }) {
    return (
        <div className="mt-6">
            <p className="text-sm font-semibold">Related searches</p>
            <ul className="mt-2 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                    <li key={tag}>
                        <Link
                            href={`/products?q=${encodeURIComponent(tag)}`}
                            className="block rounded-full border border-slate-300 bg-white px-3 py-1 text-sm hover:border-brand-500 hover:text-brand-700"
                        >
                            {tag}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ProductPageSkeleton() {
    return (
        <div className="space-y-12">
            <div className="grid animate-pulse gap-8 lg:grid-cols-2">
                <div aria-hidden className="aspect-square rounded-2xl bg-slate-100" />
                <HeadingSkeleton />
            </div>
            <ProductGridSkeleton count={4} />
        </div>
    );
}