// One product in a list: picture, brand, name, rating, price and stock.
// The whole card links to the product's page.

import Link from "next/link";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { Rating } from "@/components/rating";
import { discountPercent } from "@/lib/utils/money";
import type { Product } from "@/types/catalog";

const LOW_STOCK = 5; // show "Only N left" at or below this

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.priceCents, product.compareAtPriceCents);
  const soldOut = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
    >
      <div className={`relative ${soldOut ? "opacity-60" : ""}`}>
        <ProductImage product={product} />
        {discount ? (
          <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            -{discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium group-hover:text-brand-700">
          {product.name}
        </h3>
        <Rating rating={product.rating} reviewCount={product.reviewCount} />
        <div className="mt-auto pt-2">
          <Price
            priceCents={product.priceCents}
            compareAtPriceCents={product.compareAtPriceCents}
          />
          {soldOut ? (
            <p className="text-sm font-medium text-red-600">Out of stock</p>
          ) : product.stock <= LOW_STOCK ? (
            <p className="text-sm font-medium text-amber-700">
              Only {product.stock} left
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}