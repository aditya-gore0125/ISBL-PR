# Nandini Jewellers — Website Audit Report

**Audit date:** 2026-10-20
**Repository:** `aditya-gore0125/ISBL-PR`
**Scope:** The initial inspection was read-only. After the findings were presented, the user approved dependency upgrades and security remediation. No environment files or production services, databases, or payment endpoints were accessed.

## Approved Remediation Update

The approved changes upgraded Next.js/React, Tailwind, Cloudinary, and Mongoose; migrated the CSS/PostCSS integration and asynchronous route parameters for Next.js 15; applied same-major PostCSS/source-map overrides; and changed the admin layout to use the database-backed `requireAdmin()` guard. No business or payment logic was changed.

Post-remediation validation: `npm run lint` and `npm run build` passed. The build used `mongodb://127.0.0.1:1/isbl_audit_only`, so no real database was contacted. `npm audit` now reports one unresolved transitive HIGH advisory (five affected package entries in the ESLint dependency chain: `fast-glob > micromatch > braces@3.0.3`); npm offers no compatible patched `braces` release, and its forced recommendation would downgrade `eslint-config-next`. The direct-dependency CVE scan found no known CVEs. A local production-server smoke check returned 200 for `/`, `/about`, `/contact`, `/collections`, and `/faq`, and 401 for unauthenticated `/api/account` and `/api/admin/inquiries`.

## Executive Summary

The repository is a Next.js 15 App Router jewellery storefront with Mongoose/MongoDB, NextAuth credentials/JWT sessions, Razorpay, Cloudinary, Tailwind, and Vercel-compatible defaults. The configured lint and optimized production build both completed after the approved remediation.

The remaining findings and limitations are:

- `npm audit` exits 1 with **5 HIGH package entries** from one unresolved transitive `braces@3.0.3` advisory in the ESLint-only dependency chain. There are no remaining critical or moderate npm audit findings. The direct-dependency CVE assessment found no known CVEs.
- Admin pages now check the current database role through `requireAdmin()` in the admin layout, closing the stale-JWT page-access gap by code inspection. Runtime demotion behavior was not tested because no isolated database/admin account was available.
- At a 320px viewport, contact-channel cards extend 21 CSS pixels past the document's client width and are clipped.
- The account page can mistake an unsuccessful order-history response for an empty order list.
- Several external social links still contain placeholder destinations.
- No automated test framework or test script is configured. Database-backed CRUD, account ownership, test payments, production deployment, and live performance could not be validated safely without isolated services and test credentials.

### Production Verdict

**NOT READY FOR PRODUCTION.** The remaining high dependency advisory, the verified 320px contact-page clipping issue, and missing isolated database/payment/deployment evidence prevent a production-readiness sign-off.

## Architecture and Installed Stack

| Area | Verified implementation |
|---|---|
| Framework / routing | Next.js 15.5.28 App Router; React 19.3.1 |
| Styling | Tailwind CSS 4.3.3 |
| Authentication | NextAuth 4.24.15 credentials provider; bcryptjs password hashing; JWT sessions |
| Database | Mongoose 7.8.11; manifest and lockfile aligned |
| Payments | Razorpay SDK 2.9.8 |
| Images | Cloudinary SDK 2.11.0 |
| Validation | Zod 4.6.5 |
| Rate limiting | In-process sliding window, or Upstash REST when configured |
| Runtime observed | Node v26.5.0; npm 11.17.0 |
| Deployment | Next.js defaults are compatible with Vercel; no tracked `vercel.json` or `.vercel/` configuration was found |

Important source areas:

- `app/`: storefront, account, checkout, admin pages, API route handlers, robots, sitemap, layouts, and error/loading UI.
- `components/`: navigation, product cards/gallery, forms, and shared UI.
- `lib/`: auth, database connection reuse, validation, rate limiting, cart/pricing, and Cloudinary helpers.
- `models/`: User, Product, Category, Order, Subscriber, ContactInquiry.
- `scripts/`: admin promotion and index synchronization.

The global Mongoose connection is cached and uses bounded connection timeouts. The project defines unique user email, product slug, and subscriber email fields and a product text index. Product search/category pages and admin order lists limit results; the admin inquiries page currently retrieves the full collection.

## Features and Route Inventory

### Pages

The project contains 25 `page.js` routes; `app/not-found.js` supplies the implicit not-found UI:

- Storefront: `/`, `/about`, `/collections`, `/contact`, `/faq`, `/shipping`, `/returns`
- Catalog: `/category/[slug]`, `/product/[slug]`, `/search`
- Customer: `/login`, `/signup`, `/cart`, `/checkout`, `/account`, `/account/orders/[orderId]`, `/order-confirmation/[orderId]`
- Admin: `/admin`, `/admin/categories`, `/admin/inquiries`, `/admin/orders`, `/admin/orders/[id]`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`

### API

Twenty route-handler files were found:

| Route | Methods |
|---|---|
| `/api/account` | GET, PUT; POST, PATCH, DELETE, OPTIONS explicitly return 405 |
| `/api/admin/categories` | GET, POST |
| `/api/admin/categories/[id]` | PUT, DELETE |
| `/api/admin/inquiries` | GET, PATCH, DELETE |
| `/api/admin/orders` | GET |
| `/api/admin/orders/[id]` | GET, PUT |
| `/api/admin/products` | GET, POST |
| `/api/admin/products/[id]` | GET, PUT, DELETE |
| `/api/admin/upload` | POST |
| `/api/auth/[...nextauth]` | GET, POST |
| `/api/auth/signup` | POST |
| `/api/contact` | POST |
| `/api/newsletter` | POST |
| `/api/orders/create` | POST |
| `/api/orders/history` | GET |
| `/api/products/[slug]/reviews` | POST |
| `/api/razorpay/create-order` | POST |
| `/api/razorpay/webhook` | POST |
| `/api/seed` | GET, POST; development-only |
| `/api/seed-categories` | GET, POST; development-only |

Source inspection found shared Zod request schemas, explicit admin checks on admin APIs, user-scoped order history, server-side product pricing and stock checks, HMAC payment signature verification, and signed webhook handling. These were not exercised against a database or Razorpay test account.

## Verification Performed

| Check | Result | Evidence |
|---|---|---|
| `npm run lint` | PASS | `next lint`; no ESLint warnings or errors |
| `npm run build` | PASS | Optimized build compiled, validated, generated all 33 static pages, and emitted the app route/bundle report |
| `npm audit` | FAIL | Exit code 1; five HIGH package entries remain for one transitive `braces@3.0.3` advisory in the ESLint toolchain; no critical/moderate findings |
| Direct-dependency CVE assessment | PASS | Final scan found no known CVEs in the 16 declared direct dependencies |
| Public static route smoke | PASS | `/about`, `/contact`, `/login`, `/signup`, `/shipping`, `/returns`, `/faq`, `/collections` each returned HTTP 200 and rendered a main heading in the optimized local build |
| Database outage behavior | FAIL / limitation observed | Build/dev server used only `mongodb://127.0.0.1:1/isbl_audit_only`; the homepage rendered an application error boundary when the database was unavailable. No Atlas URI was used |
| Responsive collection page | PASS | After remediation, no horizontal overflow at 320, 375, 425, 768, 1024, 1440, or 1920px |
| Responsive contact page | FAIL | After remediation, overflow remains at 320px only; at 375, 425, 768, 1024, 1440, and 1920px there was no overflow |
| Mobile navigation | PASS | Open-menu button expanded navigation links at 320px |
| Collection images | PASS, limited | 18 images were present and none reported a completed broken-image state in this local browser run |
| API malformed JSON | PASS | Contact and signup POST with malformed JSON returned 400 |
| Unauthenticated API access | PASS, limited | Post-remediation `/api/account` and `/api/admin/inquiries` returned 401; earlier probes also found 401 for admin products, order history, and Razorpay order creation |
| Full database/e-commerce/payment/admin tests | BLOCKED | No isolated MongoDB test service, safe test account, or Razorpay test credentials were available |
| Test framework | NOT RUN | No `test` script, Playwright dependency/configuration, or tracked test files were found |
| Tracked secret-shaped scan | PASS, limited | No matches for common live-key/credential URI patterns in current tracked files or commit paths; `.env.local` was not read, and this is not an exhaustive secret scan |
| `git diff --check` | FAIL, pre-existing | Reports a blank line at EOF in the already-staged `app/api/admin/inquiries/route.js`; left untouched |

The audit server used process-only overrides pointing MongoDB at loopback port 1. No environment file was modified. No database write, real payment, or live service test was performed.

## Findings

### Dependency and lockfile risk

The initial lockfile audit reported 19 vulnerable package entries (2 critical, 15 high, 2 moderate), including Next.js, Mongoose, Cloudinary, and Tailwind. The approved upgrades now use Next.js 15.5.28, Mongoose 7.8.11, Cloudinary 2.11.0, and Tailwind 4.3.3; PostCSS 8.5.31 and source-map-js 1.2.2 are pinned through overrides. The final direct-dependency CVE scan found no known CVEs. `npm audit` still reports five package entries for the same HIGH `braces@3.0.3` transitive advisory under `eslint-config-next`; no patched compatible release is available, and npm's forced fix would downgrade the Next ESLint configuration.

### Authentication and authorization

The initial security review identified a five-minute role-refresh interval in JWT callbacks. The approved change now calls `requireAdmin()` from the admin layout, which verifies the current database role before rendering the admin route tree; the APIs also use this database-backed check. This closes the identified stale-role page-access path by inspection. A live demotion test remains blocked without an isolated database and admin account.

The local unauthenticated API probes returned 401 for the three selected protected APIs. No authenticated customer/admin, expired-token, role-tampering, cross-user order, or post-demotion test could be run.

### Frontend and accessibility

- Contact card grid overflows/clips at 320px.
- Contact form labels are not programmatically associated with their inputs (`htmlFor`/`id`); visual proximity alone is not a reliable accessible name.
- Admin navigation contains the Inquiries link twice.
- Footer social destinations include `your-handle`, `your-page`, and a zero-filled WhatsApp number; external destinations were not navigated.
- The account page parses order-history JSON but does not check `ordersRes.ok` before setting `orders`; an error payload becomes an empty list.

### Database and API reliability

The intended database outage test used a deliberately unreachable local port. The category helper fell back to defaults, but the homepage could not render product data and displayed its error boundary. No MongoDB Atlas DNS/SRV lookup, schema write, index synchronization, transaction, or connection-pool test was performed.

The admin inquiries API retrieves all inquiries without pagination and does not catch database/cast errors in its handlers. Malformed IDs and database outages may therefore produce framework-level 500 responses rather than normalized API errors. This is a code-inspection risk; it was not exercised with admin credentials.

### Payments and uploads

Source review shows checkout totals are recomputed from stored product prices, Razorpay order amounts are checked server-side, signatures use HMAC and constant-time comparison, and webhooks validate signatures. Admin image upload enforces admin authorization, image content type, and a 10MB limit. No test payment, webhook replay, payment failure, Cloudinary upload, or provider-side configuration was exercised.

### SEO, performance, and deployment

Global title/description, Open Graph/Twitter metadata, Organization structured data, product structured data, product canonical URLs, `robots.txt`, and a dynamic sitemap are implemented. Dynamic catalog metadata and sitemap product URLs depend on MongoDB; production host/site URL and actual indexed URLs were not verified.

The post-remediation production build reports shared first-load JavaScript of 103 kB, route first-load JavaScript of approximately 103–125 kB, and 56.8 kB middleware (previous baseline: 87.3 kB shared and 48.6 kB middleware). These are build outputs, not browser performance scores. No Lighthouse, field Core Web Vitals, TTFB, API latency, or database query benchmark was available. The generated build compiled successfully.

No Vercel project settings, deployment URL, production environment, Atlas access policy, or external service configuration was provided. Deployment tests are therefore blocked.

## Recommended Order of Work

1. Reassess the unresolved `braces@3.0.3` advisory when its upstream publishes a compatible patched release; do not force the current downgrade recommendation.
2. Correct the 320px contact-card clipping and associate every contact field label with its control.
3. Make account order-history errors visible instead of rendering them as an empty order list.
4. Replace placeholder footer social destinations and remove the duplicate admin navigation entry.
5. Add isolated MongoDB, payment-mock, API, and browser test coverage before asserting production readiness.
6. Verify Vercel environment settings, Atlas access, Upstash limits, Razorpay test webhooks, and deployed security headers in authorized test environments.

## Scope Limitations

This is a source/local audit, not a certification. It did not access a deployed URL, production credentials, real MongoDB, customer/admin accounts, live Razorpay, Cloudinary, Vercel settings, or an accessibility/performance test service. Runtime security and external-provider behavior remain unverified.
