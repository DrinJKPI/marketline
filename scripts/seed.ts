// Fills the table with the store's categories and products.
// Run with: npm run db:seed (after npm run db:setup).
// Safe to run again: items with the same slug are simply overwritten.
import { z } from "zod";
import { categorySchema, productSchema } from "@/lib/validation/catalog";
import { listCategories, putCategory } from "@/server/db/categories";
import { listProducts, putProduct } from "@/server/db/products";
import type { Category, Product } from "@/types/catalog";
import { reportError } from "./lib/report-error";
import { seedCategories } from "./seed-data/categories";
import { seedProducts } from "./seed-data/products";

const DAY_MS = 24 * 60 * 60 * 1000;
const NEWEST_DATE = Date.UTC(2026, 10, 5); // 5 Nov 2026 (months count from 0)

// Checks a value against a zod schema and names the item if it's invalid.
function check<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
    const result = schema.safeParse(value);
    if (!result.success) {
        throw new Error(`${label} is invalid:\n${z.prettifyError(result.error)}`);
    }
    return result.data;
}

// Turns the seed data into complete, checked categories and products.
function buildCatalog(): { categories: Category[]; products: Product[] } {
    const categories = seedCategories.map((category, index) =>
        check(
            categorySchema,
            {
                ...category,
                sortOrder: index + 1,
                imageUrl: `/categories/${category.slug}.jpg`,
            },
            `Category "${category.slug}"`,
        ),
    );

    const categorySlugs = new Set(categories.map((c) => c.slug));
    for (const slug of Object.keys(seedProducts)) {
        if (!categorySlugs.has(slug)) {
            throw new Error(`Products are listed under an unknown category: "${slug}"`);
        }
    }

    const products: Product[] = [];
    const productSlugs = new Set<string>();

    categories.forEach((category, categoryIndex) => {
        (seedProducts[category.slug] ?? []).forEach((product, position) => {
            if (productSlugs.has(product.slug)) {
                throw new Error(`Two products have the slug "${product.slug}"`);
            }
            productSlugs.add(product.slug);

            // Spread the "added" dates out, one day apart, so that "newest first"
            // mixes the categories instead of listing them one after another.
            const daysAgo = position * categories.length + categoryIndex;

            products.push(
                check(
                    productSchema,
                    {
                        ...product,
                        categorySlug: category.slug,
                        featured: product.featured ?? false,
                        images: [`/products/${product.slug}.jpg`],
                        createdAt: new Date(NEWEST_DATE - daysAgo * DAY_MS).toISOString(),
                    },
                    `Product "${product.slug}"`,
                ),
            );
        });
    });

    return { categories, products };
}

async function main() {
    const { categories, products } = buildCatalog();
    console.log(`Seed data is valid: ${categories.length} categories, ${products.length} products.`);

    for (const category of categories) await putCategory(category);
    console.log(`Saved ${categories.length} categories.`);

    for (const product of products) await putProduct(product);
    console.log(`Saved ${products.length} products.`);

    // Read everything back through the repositories, as the app will.
    const [savedCategories, savedProducts] = await Promise.all([
        listCategories(),
        listProducts(),
    ]);
    console.log(
        `Check: the table now holds ${savedCategories.length} categories and ${savedProducts.length} products.`,
    );
}

main().catch((error) => reportError("Seeding", error));