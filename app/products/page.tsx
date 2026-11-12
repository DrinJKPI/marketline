// All products in the store. On Day 4 this page gets search (?q=...) and
// filters; for now it lists everything.

import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/skeletons";
import { getAllProducts } from "@/server/services/catalog";

export const metadata: Metadata = { title: "All products" };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">All products</h1>
      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <AllProducts />
      </Suspense>
    </div>
  );
}

async function AllProducts() {
  const products = await getAllProducts();

  return (
    <>
      <p className="mt-2 text-sm text-slate-500">{products.length} products</p>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </>
  );
}