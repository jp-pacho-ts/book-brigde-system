# BookBridge

A focused ebook subscription prototype built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, and a PostgreSQL schema.

The payment flow is intentionally sample-only. It uses demo card fields only and does not send
or store any card details through a real payment gateway.

## Sample Login

- Free user: `student@bookbridge.test` / `student123`
- Premium user: `premium@bookbridge.test` / `premium123`
- Superadmin dashboard: `admin@bookbridge.test` / `admin123`

Admin tools are available at `/admin/login`. Admins can add, edit, and delete ebooks, upload cover
images and PDF files, assign categories, and choose whether each ebook is free or requires a
subscription. Superadmins can also create, edit, and delete admin accounts.

## Production File Uploads

Large PDF uploads must go directly to Vercel Blob. In Vercel, create a Blob store for this project
so `BLOB_READ_WRITE_TOKEN` is available in production. The admin form uploads the PDF to Blob first,
then saves the returned hosted URL in Neon.

## Sample Checkout

The checkout page activates premium access locally with demo card fields. The preset demo number is
`4242 4242 4242 4242`; the values are validated in the browser and discarded after activation.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional Prisma Setup

Keep your existing `.env` database connection string, then run:

```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

The seed script imports the engineering PDFs from `EBOOK_SOURCE_DIR` only when you choose to set it.
If it is not set, it uses the local download folder that was used during setup and copies the PDFs
into `public/uploads/ebooks`.
# book-bridge-system
