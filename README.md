# BookBridge

A focused ebook subscription prototype built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, and a PostgreSQL schema.

The payment flow is intentionally sample-only. It does not use card details or any real payment gateway.

## Sample Login

- Free user: `student@bookbridge.test` / `student123`
- Premium user: `premium@bookbridge.test` / `premium123`

## Sample Checkout

The checkout page activates premium access locally without showing or requiring card, wallet, or bank details.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional Prisma Setup

Create `.env` from `.env.example`, update your PostgreSQL connection string, then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```
# book-bridge-system
