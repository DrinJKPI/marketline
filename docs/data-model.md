# Data model (DynamoDB)

Marketline stores all its data in **one DynamoDB table** (`marketline`). This is the "single-table design" that AWS recommends: every kind of record (users, products, carts...) lives in the same table, and the keys are chosen so that each page can load what it needs with one or two requests.

## Why one table?

DynamoDB has no joins. Instead of joining tables at read time, we decide up front which questions the app asks (the **access patterns** below) and shape the keys so each question becomes a single `GetItem` or `Query`. Related items share a partition key, so they come back together. One table also means one name in `.env`, one set of permissions and one thing to back up.

## Table settings

| Setting        | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Table name     | `marketline` (from `DYNAMODB_TABLE_NAME`)                |
| Partition key  | `PK` (string)                                            |
| Sort key       | `SK` (string)                                            |
| GSI1           | `GSI1PK` / `GSI1SK` (strings), projects all attributes   |
| GSI2           | `GSI2PK` / `GSI2SK` (strings), projects all attributes   |
| Billing mode   | On-demand (pay per request, nothing to provision)        |
| Time to live   | Attribute `ttl` (Unix time in seconds)                   |

The key attributes have generic names (`PK`, `SK`, `GSI1PK`...) because different kinds of items put different values in them. Every item also has an `entityType` attribute (`USER`, `PRODUCT`...) so it's always clear what an item is.

A **GSI** (global secondary index) is a second copy of the table, sorted by different keys. It lets us look items up by something other than `PK`, such as "all products in a category". Items without the GSI's key attributes don't appear in it (a "sparse" index).

## Items and keys

| Entity        | PK                     | SK                       | GSI1PK                   | GSI1SK                | GSI2PK     | GSI2SK                 |
| ------------- | ---------------------- | ------------------------ | ------------------------ | --------------------- | ---------- | ---------------------- |
| User          | `USER#<userId>`        | `PROFILE`                |                          |                       |            |                        |
| Email lock    | `EMAIL#<email>`        | `EMAIL`                  |                          |                       |            |                        |
| Session       | `SESSION#<tokenHash>`  | `SESSION`                |                          |                       |            |                        |
| Category      | `CATEGORY#<slug>`      | `CATEGORY`               | `CATEGORIES`             | `<sortOrder>#<slug>`  |            |                        |
| Product       | `PRODUCT#<slug>`       | `PRODUCT`                | `CATEGORY#<categorySlug>` | `PRODUCT#<slug>`     | `PRODUCTS` | `<createdAt>#<slug>`   |
| Cart item     | `CART#<owner>`         | `ITEM#<productSlug>`     |                          |                       |            |                        |
| Wishlist item | `USER#<userId>`        | `WISHLIST#<productSlug>` |                          |                       |            |                        |

- `<owner>` is `USER#<userId>` for a logged-in shopper or `GUEST#<guestId>` for a guest. The guest ID is a random value in an `httpOnly` cookie.
- `<sortOrder>` is zero-padded (`001`, `002`...) because sort keys are compared as text.
- Products and categories are identified by their **slug** (e.g. `wireless-earbuds-pro`), which is also used in their URLs.
- Wishlist items live in the user's own partition, next to the profile, because only logged-in users have a wishlist.

### Example items

A product:

```json
{
  "PK": "PRODUCT#wireless-earbuds-pro",
  "SK": "PRODUCT",
  "GSI1PK": "CATEGORY#electronics",
  "GSI1SK": "PRODUCT#wireless-earbuds-pro",
  "GSI2PK": "PRODUCTS",
  "GSI2SK": "2026-11-06T10:00:00.000Z#wireless-earbuds-pro",
  "entityType": "PRODUCT",
  "slug": "wireless-earbuds-pro",
  "name": "Wireless Earbuds Pro",
  "brand": "Auralis",
  "categorySlug": "electronics",
  "priceCents": 7999,
  "compareAtPriceCents": 9999,
  "rating": 4.6,
  "reviewCount": 1284,
  "stock": 42,
  "featured": true
}
```

A cart item:

```json
{ "PK": "CART#GUEST#5f1c...", "SK": "ITEM#wireless-earbuds-pro", "entityType": "CART_ITEM", "productSlug": "wireless-earbuds-pro", "quantity": 2, "ttl": 1796601600 }
```

A wishlist item:

```json
{ "PK": "USER#8a3e...", "SK": "WISHLIST#wireless-earbuds-pro", "entityType": "WISHLIST_ITEM", "productSlug": "wireless-earbuds-pro", "addedAt": "2026-11-07T09:30:00.000Z" }
```

## Access patterns

Every question the app asks, and the single DynamoDB operation that answers it.

| #  | Access pattern                        | Operation and keys                                                                  |
| -- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| 1  | Sign up with a unique email           | `TransactWriteItems`: put User + put Email lock, both with `attribute_not_exists(PK)` |
| 2  | Find a user by email (log in)         | `GetItem` `EMAIL#<email>`, then `GetItem` `USER#<userId>`                            |
| 3  | Get a user by ID                      | `GetItem` `USER#<userId>` / `PROFILE`                                                |
| 4  | Create a session (log in)             | `PutItem` `SESSION#<tokenHash>` with `ttl`                                           |
| 5  | Check a session (every request)       | `GetItem` `SESSION#<tokenHash>`, then check `expiresAt`                              |
| 6  | Delete a session (log out)            | `DeleteItem` `SESSION#<tokenHash>`                                                   |
| 7  | List all categories                   | `Query` GSI1 where `GSI1PK = CATEGORIES`                                              |
| 8  | Get a category                        | `GetItem` `CATEGORY#<slug>`                                                          |
| 9  | Get a product (detail page)           | `GetItem` `PRODUCT#<slug>`                                                           |
| 10 | Products in a category                | `Query` GSI1 where `GSI1PK = CATEGORY#<slug>`                                         |
| 11 | Related products                      | Same as 10, without the current product, first 4                                     |
| 12 | All products, newest first            | `Query` GSI2 where `GSI2PK = PRODUCTS`, `ScanIndexForward = false`                    |
| 13 | Several products at once              | `BatchGetItem` on `PRODUCT#<slug>` (for the cart and wishlist pages)                 |
| 14 | Get a cart                            | `Query` where `PK = CART#<owner>`                                                    |
| 15 | Add to cart                           | `UpdateItem` `ADD quantity :n`, with a condition that keeps it at or below the maximum |
| 16 | Change a quantity                     | `UpdateItem` `SET quantity`, condition `attribute_exists(PK)`                        |
| 17 | Remove from cart                      | `DeleteItem` `CART#<owner>` / `ITEM#<productSlug>`                                   |
| 18 | Merge a guest cart into a user's cart | Pattern 14 for the guest, pattern 15 for each item, then `BatchWriteItem` deletes    |
| 19 | Get a wishlist                        | `Query` where `PK = USER#<userId>` and `begins_with(SK, "WISHLIST#")`                |
| 20 | Add to wishlist (no duplicates)       | `PutItem` with condition `attribute_not_exists(PK)`                                  |
| 21 | Remove from wishlist                  | `DeleteItem` `USER#<userId>` / `WISHLIST#<productSlug>`                              |
| 22 | Is this product in my wishlist?       | `GetItem` `USER#<userId>` / `WISHLIST#<productSlug>`                                 |

## Create, read, update and delete

| Entity        | Create                    | Read                         | Update                      | Delete                               |
| ------------- | ------------------------- | ---------------------------- | --------------------------- | ------------------------------------ |
| User          | Sign-up (1)               | By ID (3), by email (2)      | Name                        | Not in scope                         |
| Session       | Log in (4)                | Every request (5)            | None                        | Log out (6); expired ones by TTL     |
| Category      | Seed script               | List (7), by slug (8)        | Seed script                 | Seed script                          |
| Product       | Seed script               | By slug (9), lists (10–13)   | Seed script                 | Seed script                          |
| Cart item     | Add to cart (15)          | Get cart (14)                | Quantity (16), merge (18)   | Remove (17), after a merge (18)      |
| Wishlist item | Add (20)                  | List (19), check (22)        | None                        | Remove (21)                          |

The catalog (categories and products) is managed by a seed script instead of an admin screen, which is outside the brief.

## Business rules enforced by the database

- **Unique emails.** DynamoDB can only enforce uniqueness on the primary key, so each email gets its own "lock" item (`EMAIL#<email>`). The user and the lock are written in one transaction: if the email is taken, the condition fails and nothing is written.
- **No duplicate wishlist items.** The product slug is part of the key, and the write uses `attribute_not_exists(PK)`. A second add fails with `ConditionalCheckFailedException`, which the app shows as "already in your wishlist".
- **One cart line per product.** Again the product slug is part of the key, so adding a product twice increases the quantity of the same item. `ADD` is atomic, so two quick clicks can't lose an update.
- **Quantity limits.** Condition expressions can't do arithmetic, so the app passes the limit in: `attribute_not_exists(quantity) OR quantity <= :limit`, where `:limit` is the maximum minus the amount being added.

## Design decisions

- **Prices are whole cents** (`priceCents: 7999` = 79.99). Decimal numbers in JavaScript round badly (`0.1 + 0.2 !== 0.3`); integers don't.
- **The cart stores only the product and quantity.** Prices are read from the product when the cart is shown, so they're never out of date. The subtotal is calculated in `server/services`, not stored.
- **Guest carts expire.** They get a `ttl` 30 days ahead, and DynamoDB deletes them automatically afterwards. Logged-in carts have no `ttl`. Sessions also use `ttl`, but the app checks `expiresAt` itself as well, because TTL deletion can take a while.
- **Search and filters run on the server.** DynamoDB has no full-text search. With a catalog of about 60 products, pattern 12 returns the whole list in one small request, and the server filters by text, price, brand and rating and then sorts. For a large catalog, the next step would be Amazon OpenSearch Service, which can be fed from DynamoDB automatically.
- **Small, shared partitions.** All categories share `GSI1PK = CATEGORIES` and all products share `GSI2PK = PRODUCTS`. That's fine for a small catalog; a very large one would split these keys or use a search service instead.