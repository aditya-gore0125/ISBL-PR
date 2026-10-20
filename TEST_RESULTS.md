# Test Results

**Date:** 2026-10-20
**Method:** Repository inspection, configured lint/build/audit commands, optimized local build, browser smoke testing, non-mutating API probes, and post-remediation dependency checks. Database was deliberately set to an unreachable loopback endpoint for local tests.

## Summary

| Result | Count |
|---|---:|
| Checks recorded | 27 |
| Executed (PASS + FAIL) | 16 |
| PASS | 12 |
| FAIL | 4 |
| BLOCKED | 10 |
| NOT RUN | 1 |

Counts are audit check rows, not individual browser assertions or routes. Page-by-page status is listed below, with the implicit not-found fallback included as a separate route target. No production service or database was contacted.

## Audit Check Results

| Test ID | Test Name | Component | Result | Severity | Details |
|---|---|---|---|---|---|
| AUD-01 | Inspect stack, routes, dependencies, and scripts | Repository | PASS | — | Post-remediation stack: Next.js 15.5.28, React 19.3.1, Tailwind 4.3.3, Mongoose 7.8.11, Cloudinary 2.11.0; API/page inventory verified. |
| AUD-02 | `npm run lint` | ESLint | PASS | — | Exit 0; no ESLint warnings/errors. Next.js reports `next lint` is deprecated for a future Next 16 migration. |
| AUD-03 | `npm run build` | Next.js production build | PASS | — | Exit 0; Next.js 15.5.28 compiled, validated, generated all 30 static pages, and emitted route/bundle sizes. Test DB was unreachable by design; expected category fallback warnings were observed. |
| AUD-04 | `npm audit` | Dependencies | FAIL | High | Exit 1; five HIGH package entries from one unresolved transitive `braces@3.0.3` advisory in the ESLint chain. No critical/moderate findings remain. `npm audit fix --force` was not run. |
| AUD-05 | Public static route smoke | Frontend | PASS | — | Initial audit: `/about`, `/contact`, `/login`, `/signup`, `/shipping`, `/returns`, `/faq`, `/collections` returned 200. After remediation, `/`, `/about`, `/contact`, `/collections`, `/faq` returned 200. |
| AUD-06 | Homepage with database unavailable | Frontend/database | FAIL | Medium | In the isolated local fault test, the app rendered its error boundary because homepage product data could not be read. This does not establish behavior when the real database is healthy. |
| AUD-07 | Contact page viewport sweep | Responsive UI | FAIL | Medium | Rechecked after remediation: at 320px, document scroll width was 326px against a client width of 305px. At 375, 425, 768, 1024, 1440, and 1920px, no overflow was found. |
| AUD-08 | Collection page viewport sweep | Responsive UI | PASS | — | Rechecked after remediation: at 320, 375, 425, 768, 1024, 1440, and 1920px, document scroll width equaled client width. Browser viewport reported 426px for the 425px request. |
| AUD-09 | Mobile navigation interaction | Navigation | PASS | — | Rechecked after remediation at 320px: opening the menu set `aria-expanded=true`; mobile About and Contact links were visible. |
| AUD-10 | Collection image rendering | Images | PASS | — | 18 image elements; zero completed broken images in this local run. This is not a catalog-wide or remote-image check. |
| AUD-11 | Malformed JSON validation | Contact/signup APIs | PASS | — | Malformed JSON POSTs returned 400 for both `/api/contact` and `/api/auth/signup`. |
| AUD-12 | Unauthenticated API rejection | Authorization | PASS | — | Initial probes: `/api/admin/products`, `/api/orders/history`, and `/api/razorpay/create-order` returned 401. Post-remediation `/api/account` and `/api/admin/inquiries` also returned 401 without a session. |
| AUD-13 | Unsupported API methods | API routing | BLOCKED | — | A GET to the POST-only contact route timed out during local server startup; no reliable status was captured. Explicit 405 behavior was not verified. |
| AUD-14 | Database CRUD, index, and failure scenarios | MongoDB/Mongoose | BLOCKED | — | No isolated MongoDB service/test DB was available. A loopback-only connection failure was observed; Atlas was not contacted. |
| AUD-15 | Registration and login end-to-end | Authentication | BLOCKED | — | No test database/account; credential creation, password verification, session refresh, logout, and redirect behavior not exercised. |
| AUD-16 | Cart, checkout, payment, webhook, and order creation | Commerce | BLOCKED | — | No product database or Razorpay test credentials. No payment transaction or webhook was attempted. |
| AUD-17 | Account ownership and order privacy | Authorization | BLOCKED | — | No authenticated customer accounts or order fixtures to test cross-user access. |
| AUD-18 | Admin dashboard and CRUD | Admin | BLOCKED | — | No admin test account or isolated data store. |
| AUD-19 | Contact submission persistence | Contact | BLOCKED | — | Successful form submission would write to the database; no isolated test DB was available. |
| AUD-20 | Deployed Vercel/production smoke | Deployment | BLOCKED | — | No deployed URL or production test environment was provided. |
| AUD-21 | Lighthouse/Core Web Vitals/latency benchmarks | Performance | BLOCKED | — | No Lighthouse/performance runner or deployed target. Build bundle output is reported separately. |
| AUD-22 | Full accessibility and SEO validation | Accessibility/SEO | BLOCKED | — | No axe/Lighthouse run or complete manual keyboard/screen-reader/contrast audit. Static source review found contact-label association gaps. |
| AUD-23 | Credential-shaped patterns in tracked files/history | Repository security | PASS | — | The bounded scan found no common live-key/credential-URI patterns. It did not inspect `.env.local` values or certify all secret types. |
| AUD-24 | `npm test` / Playwright test suite | Automated tests | NOT RUN | — | `package.json` has no test script; no Playwright dependency/config or tracked test files were found. No test tooling was installed. |
| AUD-25 | `git diff --check` | Existing worktree changes | FAIL | Low | Reports a blank line at EOF in the already-staged `app/api/admin/inquiries/route.js`. It was pre-existing user work and was not changed. |
| AUD-26 | Final direct-dependency CVE assessment | Dependencies | PASS | — | Final scan of all 16 declared direct dependencies found no known CVEs. This does not override npm audit's unresolved transitive `braces` result. |
| AUD-27 | Post-remediation local HTTP smoke | Frontend/API | PASS | — | Production server with isolated loopback DB settings returned 200 for `/`, `/about`, `/contact`, `/collections`, `/faq`; unauthenticated `/api/account` and `/api/admin/inquiries` returned 401. |

## Page Route Coverage

| Route | Result | Observed behavior |
|---|---|---|
| `/` | FAIL under injected DB outage | Error boundary shown when isolated MongoDB port 1 was unreachable. |
| `/about` | PASS | HTTP 200; main heading rendered. |
| `/account` | BLOCKED | Requires authenticated account/test data. |
| `/account/orders/[orderId]` | BLOCKED | Requires authenticated account and order fixture. |
| `/cart` | BLOCKED | Not exercised with a populated persistent cart. |
| `/category/[slug]` | BLOCKED | Requires database product data. |
| `/checkout` | BLOCKED | Requires authenticated session and cart/payment test setup. |
| `/collections` | PASS | HTTP 200; 18 images; responsive sweep passed. |
| `/contact` | PASS, with responsive failure | HTTP 200; form rendered. 320px layout clips the contact cards. |
| `/faq` | PASS | HTTP 200; main heading rendered. |
| `/login` | PASS | HTTP 200; form page rendered; authentication not attempted. |
| `/order-confirmation/[orderId]` | BLOCKED | Requires authenticated session and database order. |
| `/product/[slug]` | BLOCKED | Requires a database product. |
| `/returns` | PASS | HTTP 200; main heading rendered. |
| `/search` | BLOCKED | Requires database product data. |
| `/shipping` | PASS | HTTP 200; main heading rendered. |
| `/signup` | PASS | HTTP 200; form page rendered; registration not submitted. |
| `/admin` | BLOCKED | Protected route; no admin test session. |
| `/admin/categories` | BLOCKED | Protected route; no admin test session. |
| `/admin/inquiries` | BLOCKED | Protected route; no admin test session. |
| `/admin/orders` | BLOCKED | Protected route; no admin test session. |
| `/admin/orders/[id]` | BLOCKED | Protected route; no admin test session/order. |
| `/admin/products` | BLOCKED | Protected route; no admin test session. |
| `/admin/products/new` | BLOCKED | Protected route; no admin test session. |
| `/admin/products/[id]/edit` | BLOCKED | Protected route; no admin test session/product. |
| `/_not-found` | NOT RUN | No direct invalid-page browser test. |

## API Route Inventory and Probe Results

Twenty API route-handler files were found. Methods shown are source exports; only the explicit probes below were executed.

| Route | Methods | Probe |
|---|---|---|
| `/api/account` | GET, PUT, POST, PATCH, DELETE, OPTIONS | NOT RUN |
| `/api/admin/categories` | GET, POST | NOT RUN |
| `/api/admin/categories/[id]` | PUT, DELETE | NOT RUN |
| `/api/admin/inquiries` | GET, PATCH, DELETE | NOT RUN |
| `/api/admin/orders` | GET | NOT RUN |
| `/api/admin/orders/[id]` | GET, PUT | NOT RUN |
| `/api/admin/products` | GET, POST | GET unauthenticated: 401 |
| `/api/admin/products/[id]` | GET, PUT, DELETE | NOT RUN |
| `/api/admin/upload` | POST | NOT RUN |
| `/api/auth/[...nextauth]` | GET, POST | Session endpoint returned 200 during local browser load; login not tested |
| `/api/auth/signup` | POST | Malformed JSON: 400 |
| `/api/contact` | POST | Malformed JSON: 400; GET method attempt timed out |
| `/api/newsletter` | POST | NOT RUN |
| `/api/orders/create` | POST | NOT RUN |
| `/api/orders/history` | GET | Unauthenticated: 401 |
| `/api/products/[slug]/reviews` | POST | NOT RUN |
| `/api/razorpay/create-order` | POST | Unauthenticated: 401 |
| `/api/razorpay/webhook` | POST | NOT RUN |
| `/api/seed` | GET, POST | NOT RUN; destructive-capable seed route intentionally not invoked |
| `/api/seed-categories` | GET, POST | NOT RUN; seed route intentionally not invoked |

Statuses observed locally: **200** for the listed public pages/session endpoint; **400** for malformed JSON; **401** for the three protected API probes. The audit did not exercise 201, 403, 404, 405, 409, 429, or application-generated 500 cases.

## End-to-End Scenarios

| Scenario | Result | Reason |
|---|---|---|
| Customer registration | BLOCKED | No isolated test DB. |
| Customer login/session/logout | BLOCKED | No safe test account/database. |
| Browse product/add/update cart | BLOCKED | No seeded test products. |
| Checkout/test payment/order confirmation | BLOCKED | No test products/session or Razorpay test credentials. |
| Customer account/order history | BLOCKED | No test account/orders. |
| Admin authentication/dashboard | BLOCKED | No admin test account. |
| Admin product CRUD | BLOCKED | No admin test account/database. |
| Contact form persistence | BLOCKED | No isolated database. |
| Unauthenticated access rejection | PASS, limited | Three selected API operations returned 401; other customer/admin boundaries remain untested. |
| Database/network error handling | FAIL, limited | Homepage error boundary observed with DB unavailable; other routes and mutation failure modes not tested. |

## Reproduction Notes

- **320px contact clipping:** Start the optimized build locally, set browser viewport to 320×812, navigate to `/contact`, and inspect document/card bounds. Browser reported client width 305px, document scroll width 326px, and cards extending to x=326.
- **Homepage database outage:** Run local build/server with `MONGODB_URI=mongodb://127.0.0.1:1/isbl_audit_only`; request `/`. The connection is refused and the page error boundary is shown. This does not test production Atlas availability.
- **Dependency scan:** `npm audit` after approved updates exited 1 with five HIGH package entries from one `braces@3.0.3` advisory. The direct-dependency CVE scan found no known CVEs. The upstream package has no compatible patched release; the forced npm recommendation would downgrade `eslint-config-next`.
- **Existing diff check:** `git diff --check` reported a new blank line at EOF in already-staged `app/api/admin/inquiries/route.js`; no unrelated working changes were modified.
