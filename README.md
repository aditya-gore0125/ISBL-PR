# Nandini Jewellers

A Next.js 14 jewelry storefront with MongoDB, NextAuth, and Razorpay integration.

## Run locally

Requirements: Node.js 18.17+ and a MongoDB database.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `.env.local` with:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
NEXTAUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

`NEXT_PUBLIC_SITE_URL` should be the production HTTPS URL after deployment. Razorpay values are only needed for checkout payment creation.

## Seed the database

With `NODE_ENV=development`, start the dev server and send:

```bash
curl -X POST http://localhost:3000/api/seed
```

The seed route is intentionally disabled outside development. Do not expose or enable it in production.

## Validate and deploy

```bash
npm run build
npm run start
```

For Vercel:

1. Import this repository into Vercel and keep the framework preset as Next.js.
2. Add the same environment variables in the Vercel project settings, using the production MongoDB Atlas connection string and the deployed HTTPS URL for `NEXT_PUBLIC_SITE_URL`.
3. In MongoDB Atlas, add Vercel's outbound access as allowed network access, preferably using a restricted production setup rather than `0.0.0.0/0`.
4. Create a production database user with only the permissions this store needs.
5. Deploy. Configure the Razorpay production webhook and allowed callback/origin settings to use the deployed Vercel domain.

The dynamic sitemap and robots files are available at `/sitemap.xml` and `/robots.txt`. Product and category URLs are read from MongoDB when those files are generated.
