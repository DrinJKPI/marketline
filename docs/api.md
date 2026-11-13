# Cart API

The cart is changed through a small JSON API (Next.js Route Handlers in `app/api/`). The "Add to cart" button and the cart page use it from the browser. The cart belongs to the logged-in user, or to a guest identified by an `httpOnly` cookie; the API never takes a user ID from the request.

| Method   | Path                      | Body                                                  | Does                          |
| -------- | ------------------------- | ----------------------------------------------------- | ----------------------------- |
| `GET`    | `/api/cart`               |                                                       | Returns the current cart      |
| `POST`   | `/api/cart`               | `{ "productSlug": "air-fryer-5l", "quantity": 2 }`    | Adds a product (quantity 1–10, default 1) |
| `PATCH`  | `/api/cart/items/{slug}`  | `{ "quantity": 3 }`                                    | Sets a product's quantity     |
| `DELETE` | `/api/cart/items/{slug}`  |                                                       | Removes a product             |

Every successful response is `{ "cart": { "lines": [...], "itemCount": 3, "subtotalCents": 26997 } }`. Each line holds the product, its quantity, `lineTotalCents` and `maxQuantity`.

## Errors

Errors are `{ "error": "message" }` with a status code:

| Status | When                                                              |
| ------ | ----------------------------------------------------------------- |
| 400    | Invalid body, e.g. a quantity of 0 or not a number                |
| 404    | The product doesn't exist, or isn't in the cart (PATCH)          |
| 409    | Out of stock, or more than the limit (10, or fewer if stock is low) |
| 415    | The body isn't sent as JSON                                       |
| 500    | Something unexpected; details are logged on the server only      |

## Rules

- At most 10 of one product, and never more than the stock.
- Adding uses DynamoDB's atomic `ADD` with a condition, so quick repeated clicks are all counted and can't go over the limit.
- Prices are never stored in the cart: they're read from the product each time, so the subtotal is always current.
- Guest carts expire 30 days after their last change (DynamoDB time to live).
- When a guest logs in or signs up, their cart is merged into their account's cart (quantities added together, capped at the limit) and the guest cart is deleted.
- Only JSON bodies are accepted: a form on another website can't send JSON without the browser asking our permission first (CORS), which we never give.