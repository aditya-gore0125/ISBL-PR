# Nandini Jewellers

A Next.js jewelry storefront with MongoDB, NextAuth, Razorpay, Cloudinary image uploads, and optional Upstash-backed rate limiting.

## Local Setup

Requirements: Node.js 20.6+ and a MongoDB database. Node 20.6 or later is needed for the `--env-file` commands used by the maintenance scripts.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Create `.env.local` in the repository root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
NEXTAUTH_SECRET=<long-random-secret>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RAZORPAY_KEY_ID=<test-key-id>
RAZORPAY_KEY_SECRET=<test-key-secret>
RAZORPAY_WEBHOOK_SECRET=<test-webhook-secret>

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Optional: configure both values to share rate limits across server instances.
UPSTASH_REDIS_REST_URL=<upstash-redis-rest-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-redis-rest-token>
```

`NEXTAUTH_SECRET` should be a cryptographically random secret, for example one generated with `openssl rand -base64 32`. Do not commit `.env.local` or expose server-only values through client code. If Upstash is not configured, rate limiting uses an in-memory sliding window local to the current server process; this fallback is not shared across serverless instances.

`NODE_ENV` is also read by the application, but Next.js sets it automatically; do not add it to `.env.local`.

## Database Setup

Start the development server, then seed the initial products and categories. Both seed endpoints only operate in development mode:

```bash
curl -X POST http://localhost:3000/api/seed
curl -X POST http://localhost:3000/api/seed-categories
```

Do not expose or enable these development-only routes in production.

Create an account through `/signup`, then grant it admin access from the repository root:

```bash
npm run make-admin -- admin@example.com
```

The target email must already belong to a registered user. Log out and log back in after changing the role so the session refreshes.

Synchronize database indexes after schema/index changes and during deployment setup:

```bash
npm run db:indexes
```

This creates and synchronizes the unique subscriber email index as well as the application model indexes.

## Cloudinary

Create a Cloudinary account and copy the cloud name, API key, and API secret into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. The API secret is server-only. Admin product/category image uploads use Cloudinary; uploads are limited to image files up to 10 MB.

## Razorpay

Start with Razorpay test-mode credentials in `.env.local`. Set the test key ID, key secret, and webhook secret. Checkout uses server-side order creation and payment-signature verification; do not place the key secret or webhook secret in browser code.

Before switching to live payments:

1. Activate the Razorpay account and enable live mode.
2. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with the live credentials in every deployment environment.
3. Create a live-mode webhook and set `RAZORPAY_WEBHOOK_SECRET` to that webhook's signing secret.
4. Subscribe to `payment.captured` and `payment.failed` events.
5. Set the webhook URL to `https://<your-deployed-domain>/api/razorpay/webhook` and verify it with a test event.
6. Confirm the checkout page uses the live key ID. Never mix test and live credentials or reuse the test webhook secret.

## Deploy To Vercel And Atlas

1. Create a production database and least-privilege database user in MongoDB Atlas.
2. Configure Atlas network access for the deployment environment. Prefer private networking or a constrained allowlist; avoid opening the database to `0.0.0.0/0` unless there is no safer supported option.
3. Import the repository into Vercel with the Next.js framework preset.
4. Add all required environment variables from the list above in Vercel Project Settings. Use the production Atlas URI, a new production `NEXTAUTH_SECRET`, and set both `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the deployed `https://` origin.
5. Add the production Razorpay and Cloudinary credentials. Add both Upstash values if rate limits must be shared across instances.
6. Deploy, then run `npm run db:indexes` against the production database from a trusted environment.
7. Configure the Razorpay live webhook URL as `https://<your-deployed-domain>/api/razorpay/webhook`, using the live webhook signing secret.
8. Verify sign-in, product images, a test/live-appropriate checkout, webhook delivery, `/robots.txt`, and `/sitemap.xml` after deployment.

The security headers include a Content Security Policy for the storefront, Razorpay checkout, Cloudinary images, and Google Fonts. The sitemap includes static pages and categories if MongoDB is temporarily unavailable; product URLs are added when the database can be reached.

## Quality Checks

```bash
npm run lint
npm run build
```
