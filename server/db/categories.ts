// Database operations for categories (access patterns 7 and 8 in
// docs/data-model.md). The rest of the app calls these functions and never
// sees DynamoDB keys or commands.
import "server-only";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { categorySchema } from "@/lib/validation/catalog";
import { getDb } from "@/server/db/client";
import { queryAll } from "@/server/db/helpers";
import { GSI1, keys, partitions, sortKeys } from "@/server/db/keys";
import type { Category } from "@/types/catalog";

// A stored item -> a Category (checks it and drops the keys).
const toCategory = (item: Record<string, unknown>): Category =>
  categorySchema.parse(item);

// All categories, in menu order.
export async function listCategories(): Promise<Category[]> {
  const items = await queryAll({
    IndexName: GSI1,
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: { ":pk": partitions.allCategories },
  });
  return items.map(toCategory);
}

// One category, or null if there's no category with this slug.
export async function getCategory(slug: string): Promise<Category | null> {
  const { doc, tableName } = getDb();
  const { Item } = await doc.send(
    new GetCommand({ TableName: tableName, Key: keys.category(slug) }),
  );
  return Item ? toCategory(Item) : null;
}

// Creates a category, or replaces it if the slug already exists.
// Used by the seed script.
export async function putCategory(category: Category): Promise<void> {
  const { doc, tableName } = getDb();
  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        ...keys.category(category.slug),
        GSI1PK: partitions.allCategories,
        GSI1SK: sortKeys.category(category.sortOrder, category.slug),
        entityType: "CATEGORY",
        ...category,
      },
    }),
  );
}