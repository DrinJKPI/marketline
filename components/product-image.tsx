// A product's picture: its photo when it has one, otherwise a placeholder
// (the product's icon on its category colour). Always square.

import Image from "next/image";
import { getProductVisual } from "@/lib/product-visuals";
import type { Product } from "@/types/catalog";

type ProductImageProps = {
  product: Pick<Product, "slug" | "name" | "categorySlug" | "images">;
  // Tells the browser how wide the image is shown, so it can pick a size.
  sizes?: string;
};

export function ProductImage({
  product,
  sizes = "(min-width: 1024px) 25vw, 50vw",
}: ProductImageProps) {
  const photo = product.images[0];
  const visual = getProductVisual(product);

  return (
    <div className="relative aspect-square overflow-hidden">
      {photo ? (
        <Image
          src={photo}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={product.name}
          className={`flex h-full w-full items-center justify-center ${visual.className}`}
        >
          <visual.icon aria-hidden className="h-2/5 w-2/5" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}