// A responsive grid of product cards: 2 columns on phones, up to 4 on wide screens.

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/catalog";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}