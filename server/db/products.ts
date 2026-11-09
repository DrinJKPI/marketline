// Database operations for products (access patterns 9 to 13 in
// docs/data-model.md). Sorting, filtering and search are business logic,
// so they live in server/services, not here.
import "server-only";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productSchema } from "@/lib/validation/catalog";
import { getDb } from "@/server/db/client";
import { batchGetAll, queryAll } from "@/server/db/helpers";
import { GSI1, GSI2, keys, partitions, sortKeys } from "@/server/db/keys";
import type { Product } from "@/types/catalog";

// A stored item -> a Product (checks it and drops the keys).
const toProduct = (item: Record<string, unknown>): Product =>
  productSchema.parse(item);

// One product, or null if there's no product with this slug.
export async function getProduct(slug: string): Promise<Product | null> {
  const { doc, tableName } = getDb();
  const { Item } = await doc.send(
    new GetCommand({ TableName: tableName, Key: keys.product(slug) }),
  );
  return Item ? toProduct(Item) : null;
}

// All products in one category.
export async function listProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const items = await queryAll({
    IndexName: GSI1,
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: {
      ":pk": partitions.categoryProducts(categorySlug),
    },
  });
  return items.map(toProduct);
}

// Every product in the store, newest first.
export async function listProducts(): Promise<Product[]> {
  const items = await queryAll({
    IndexName: GSI2,
    KeyConditionExpression: "GSI2PK = :pk",
    ExpressionAttributeValues: { ":pk": partitions.allProducts },
    ScanIndexForward: false, // descending: newest first
  });
  return items.map(toProduct);
}

// Several products by slug, in the same order as the slugs. Slugs of
// products that don't exist (any more) are skipped.
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const unique = [...new Set(slugs)]; // BatchGetItem rejects duplicate keys
  const items = await batchGetAll(unique.map(keys.product));
  const bySlug = new Map(
    items.map(toProduct).map((product) => [product.slug, product]),
  );
  return unique.flatMap((slug) => bySlug.get(slug) ?? []);
}

// Creates a product, or replaces it if the slug already exists.
// Used by the seed script.
export async function putProduct(product: Product): Promise<void> {
  const { doc, tableName } = getDb();
  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        ...keys.product(product.slug),
        GSI1PK: partitions.categoryProducts(product.categorySlug),
        GSI1SK: sortKeys.productInCategory(product.slug),
        GSI2PK: partitions.allProducts,
        GSI2SK: sortKeys.productByDate(product.createdAt, product.slug),
        entityType: "PRODUCT",
        ...product,
      },
    }),
  );
}