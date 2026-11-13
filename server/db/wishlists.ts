// Database operations for wishlists (access patterns 19 to 22 in
// docs/data-model.md). Wishlist items live in the user's own partition:
// PK = USER#<userId>, SK = WISHLIST#<productSlug>.
import "server-only";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDb } from "@/server/db/client";
import { queryAll } from "@/server/db/helpers";
import { keys, partitions, prefixes } from "@/server/db/keys";
import type { WishlistItem } from "@/types/cart";

// Thrown when the product is already in the wishlist.
export class AlreadyInWishlistError extends Error {
  constructor() {
    super("This product is already in your wishlist.");
    this.name = "AlreadyInWishlistError";
  }
}

const toWishlistItem = (item: Record<string, unknown>): WishlistItem => ({
  productSlug: String(item.productSlug),
  addedAt: String(item.addedAt),
});

// Everything in a user's wishlist. The user's partition also holds their
// profile, so begins_with picks out only the wishlist items.
export async function listWishlistItems(userId: string): Promise<WishlistItem[]> {
  const items = await queryAll({
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":pk": partitions.user(userId),
      ":prefix": prefixes.wishlistItem,
    },
  });
  return items.map(toWishlistItem);
}

// Adds a product. The product is part of the key, and the condition makes
// DynamoDB refuse a second copy: duplicates are impossible, even if two
// requests arrive at the same moment.
export async function addWishlistItem(
  userId: string,
  productSlug: string,
): Promise<void> {
  const { doc, tableName } = getDb();
  try {
    await doc.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          ...keys.wishlistItem(userId, productSlug),
          entityType: "WISHLIST_ITEM",
          productSlug,
          addedAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );
  } catch (error) {
    if ((error as Error)?.name === "ConditionalCheckFailedException") {
      throw new AlreadyInWishlistError();
    }
    throw error;
  }
}

export async function removeWishlistItem(
  userId: string,
  productSlug: string,
): Promise<void> {
  const { doc, tableName } = getDb();
  await doc.send(
    new DeleteCommand({
      TableName: tableName,
      Key: keys.wishlistItem(userId, productSlug),
    }),
  );
}

export async function hasWishlistItem(
  userId: string,
  productSlug: string,
): Promise<boolean> {
  const { doc, tableName } = getDb();
  const { Item } = await doc.send(
    new GetCommand({
      TableName: tableName,
      Key: keys.wishlistItem(userId, productSlug),
      ProjectionExpression: "PK", // we only need to know it exists
    }),
  );
  return Boolean(Item);
}