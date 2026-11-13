// Database operations for carts (access patterns 14 to 18 in
// docs/data-model.md). Each product in a cart is one item:
// PK = CART#USER#<id> or CART#GUEST#<id>, SK = ITEM#<productSlug>.
import "server-only";
import {
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getDb } from "@/server/db/client";
import { batchDeleteAll, queryAll } from "@/server/db/helpers";
import { keys, partitions } from "@/server/db/keys";
import type { CartItem, CartOwner } from "@/types/cart";

const GUEST_CART_DAYS = 30;

// Thrown when adding would take a product over its quantity limit.
export class CartLimitError extends Error {
  constructor() {
    super("That would be more than the limit for this product.");
    this.name = "CartLimitError";
  }
}

// Thrown when changing a product that isn't in the cart.
export class NotInCartError extends Error {
  constructor() {
    super("This product isn't in your cart.");
    this.name = "NotInCartError";
  }
}

const isConditionFailure = (error: unknown) =>
  (error as Error)?.name === "ConditionalCheckFailedException";

// Guest carts expire 30 days after their last change (DynamoDB time to
// live). Carts of logged-in users never expire.
function expiryFor(owner: CartOwner): number | undefined {
  if (owner.kind === "user") return undefined;
  return Math.floor(Date.now() / 1000) + GUEST_CART_DAYS * 24 * 60 * 60;
}

const toCartItem = (item: Record<string, unknown>): CartItem => ({
  productSlug: String(item.productSlug),
  quantity: Number(item.quantity),
  addedAt: String(item.addedAt),
});

export async function listCartItems(owner: CartOwner): Promise<CartItem[]> {
  const items = await queryAll({
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: { ":pk": partitions.cart(owner) },
  });
  return items.map(toCartItem);
}

// Adds `quantity` of a product, creating the cart line if needed. ADD is
// atomic, so two quick clicks both count. The condition stops the total
// going over `maxQuantity` (condition expressions can't do sums, so we
// pass in the highest quantity that may already be there).
export async function addCartItem(
  owner: CartOwner,
  productSlug: string,
  quantity: number,
  maxQuantity: number,
): Promise<void> {
  const { doc, tableName } = getDb();
  const ttl = expiryFor(owner);
  const now = new Date().toISOString();

  try {
    await doc.send(
      new UpdateCommand({
        TableName: tableName,
        Key: keys.cartItem(owner, productSlug),
        UpdateExpression:
          "SET entityType = :type, productSlug = :slug, " +
          "addedAt = if_not_exists(addedAt, :now), updatedAt = :now" +
          (ttl ? ", #ttl = :ttl" : "") +
          " ADD quantity :quantity",
        ConditionExpression:
          "attribute_not_exists(quantity) OR quantity <= :highest",
        ExpressionAttributeNames: ttl ? { "#ttl": "ttl" } : undefined, // TTL is a reserved word
        ExpressionAttributeValues: {
          ":type": "CART_ITEM",
          ":slug": productSlug,
          ":now": now,
          ":quantity": quantity,
          ":highest": maxQuantity - quantity,
          ...(ttl ? { ":ttl": ttl } : {}),
        },
      }),
    );
  } catch (error) {
    if (isConditionFailure(error)) throw new CartLimitError();
    throw error;
  }
}

// Sets the quantity of a product that's already in the cart.
export async function setCartItemQuantity(
  owner: CartOwner,
  productSlug: string,
  quantity: number,
): Promise<void> {
  const { doc, tableName } = getDb();
  const ttl = expiryFor(owner);

  try {
    await doc.send(
      new UpdateCommand({
        TableName: tableName,
        Key: keys.cartItem(owner, productSlug),
        UpdateExpression:
          "SET quantity = :quantity, updatedAt = :now" + (ttl ? ", #ttl = :ttl" : ""),
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeNames: ttl ? { "#ttl": "ttl" } : undefined,
        ExpressionAttributeValues: {
          ":quantity": quantity,
          ":now": new Date().toISOString(),
          ...(ttl ? { ":ttl": ttl } : {}),
        },
      }),
    );
  } catch (error) {
    if (isConditionFailure(error)) throw new NotInCartError();
    throw error;
  }
}

// Writes a whole cart line, replacing any existing one. Used when merging.
export async function putCartItem(owner: CartOwner, item: CartItem): Promise<void> {
  const { doc, tableName } = getDb();
  const ttl = expiryFor(owner);
  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        ...keys.cartItem(owner, item.productSlug),
        entityType: "CART_ITEM",
        ...item,
        updatedAt: new Date().toISOString(),
        ...(ttl ? { ttl } : {}),
      },
    }),
  );
}

// Removes one product. Removing something that isn't there is not an error.
export async function removeCartItem(
  owner: CartOwner,
  productSlug: string,
): Promise<void> {
  const { doc, tableName } = getDb();
  await doc.send(
    new DeleteCommand({
      TableName: tableName,
      Key: keys.cartItem(owner, productSlug),
    }),
  );
}

// Removes several products at once (used after merging a guest cart).
export async function removeCartItems(
  owner: CartOwner,
  productSlugs: string[],
): Promise<void> {
  await batchDeleteAll(productSlugs.map((slug) => keys.cartItem(owner, slug)));
}