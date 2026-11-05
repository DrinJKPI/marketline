# Marketline

Marketline is a full-stack e-commerce web app: a general online store with categories, product search and filtering, a shopping cart and a wishlist. It is built with Next.js and AWS DynamoDB.

Built as the second Software Engineer Intern project for Tynoc Tech.

> Work in progress. This README grows as the project does.

## Tech stack

| Layer      | Choice                                                   |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, TypeScript            |
| UI         | Tailwind CSS 4                                           |
| Backend    | Next.js Route Handlers and Server Actions                |
| Database   | AWS DynamoDB (DynamoDB Local during development)         |
| Validation | zod                                                      |
| Hosting    | Vercel                                                   |
| CI         | GitHub Actions: lint, type-check and build on every push |

## Roadmap

- [ ] **Day 1 – Setup and planning:** tools, project setup, CI, DynamoDB connection, data model
- [ ] **Day 2 – Database:** table creation script, repositories, seed data
- [ ] **Day 3 – Storefront:** header and footer, homepage, category pages, product listing
- [ ] **Day 4 – Products:** product detail, related products, search and filters
- [ ] **Day 5 – Accounts:** sign-up, login, sessions
- [ ] **Day 6 – Cart:** guest and account carts, quantities, subtotal, merge on login
- [ ] **Day 7 – Wishlist and states:** wishlist without duplicates; loading, empty, error and 404 pages
- [ ] **Day 8 – Polish and deployment:** business-logic tests, real AWS table, Vercel
- [ ] **Day 9 – Final testing:** end-to-end checks, screenshots, documentation

## Run locally

Prerequisites: Node.js 20.9 or newer (24 recommended), Java 21 for DynamoDB Local, and Git.

```bash
git clone <this-repo-url>
cd marketline
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
```

Start [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) in a separate terminal from the folder you extracted it to:

```bash
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Then check the connection and start the app:

```bash
npm run db:ping
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command             | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the development server               |
| `npm run build`     | Create a production build                  |
| `npm start`         | Run the production build                   |
| `npm run lint`      | Lint with ESLint                           |
| `npm run typecheck` | Generate route types and run `tsc`         |
| `npm run db:ping`   | Check the connection to DynamoDB           |