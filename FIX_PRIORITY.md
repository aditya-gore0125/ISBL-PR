# Fix Priority

This list reflects the original audit and approved remediation. Dependency and admin-authorization items marked RESOLVED were addressed; unrelated UI/behavior findings remain open. Priorities reflect observed evidence and the production impact if the stated condition applies.

## CRITICAL

| Issue | Exact location | Evidence | Recommended fix | Regression risk | Retest |
|---|---|---|---|---|---|
| Vulnerable Next.js version in lockfile — RESOLVED | `package.json`, `package-lock.json` (`next@15.5.28`) | Initial `npm audit` reported critical Next.js advisories; final audit and direct-dependency scan no longer report Next.js | Updated to the approved patched Next.js 15 release and migrated async request parameters | High: framework, middleware, image optimization, routing, caching | Lint/build pass; live deployment, middleware edge, and real image-service behavior remain untested |
| Vulnerable Mongoose version locked — RESOLVED | `package.json`, `package-lock.json` (`mongoose@7.8.11`) | Initial lockfile resolved 7.5.1 while the local install had 7.8.11; manifest and lock now align at the patched version | Updated within major version 7 | Medium/high: schema casting, validation, query/update behavior, transactions | Lint/build pass; database CRUD, transactions, and failure tests remain blocked without isolated DB |

## HIGH

| Issue | Exact location | Evidence | Recommended fix | Regression risk | Retest |
|---|---|---|---|---|---|
| Vulnerable Cloudinary SDK — RESOLVED | `package.json`, `package-lock.json` (`cloudinary@2.11.0`) | Initial audit reported HIGH arbitrary-argument-injection advisory; final audit and direct-dependency scan no longer report Cloudinary | Updated to Cloudinary 2.11.0 | Medium: major SDK API/response changes | Build passes; actual upload/error/response behavior remains untested without a non-production account |
| Remaining transitive `braces` advisory | `package-lock.json`: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces@3.0.3` | Final `npm audit` reports five HIGH package entries for this single stack-exhaustion DoS advisory. No compatible patched braces release is available; `npm audit fix --force` would downgrade `eslint-config-next` to 14.2.35 | Keep the compatible Next 15 lint configuration; re-evaluate when upstream publishes a patched compatible release. Do not force an unsupported downgrade | Low runtime exposure; the affected dependency is in the lint/build toolchain, but npm audit still fails | Re-run `npm audit`, lint, and build after upstream fix |

## MEDIUM

| Issue | Exact location | Evidence | Recommended fix | Regression risk | Retest |
|---|---|---|---|---|---|
| Stale admin role after demotion — RESOLVED BY CODE CHANGE | `app/admin/layout.js:20-21`; `lib/requireAdmin.js` | Admin layout previously trusted the cached JWT role. It now calls `requireAdmin()`, which checks the current database role on each admin route render | Admin pages and APIs now check the current database role; JWT claim refresh cadence remains unchanged | Medium: database availability is now required to render admin pages | Build passes; live role demotion and DB-outage behavior remain blocked without isolated database/admin account |
| Contact layout clips at 320px | `app/(shop)/contact/page.js:38-40` | Browser measured client width 305px and card right edge 326px at a 320px viewport | Allow grid items to shrink/wrap within available width | Low/medium: layout reflow | Test 320, 375, 425, 768, 1024, 1440, 1920; inspect every contact card and form |
| Failed order-history response looks empty | `app/(shop)/account/page.js:102,109` | JSON is parsed and `ordersData.orders || []` is used without checking `ordersRes.ok` | Surface an order-loading error separately from a genuine empty state | Low/medium: changes account error-state display | Simulate 401, 500, invalid JSON, empty and non-empty history |
| Homepage unavailable during DB outage | `app/(shop)/page.js`; shared query path and error boundary | Isolated DB outage produced an error boundary, despite category fallback | Decide and document desired degraded-mode behavior; keep outage errors visible if the product catalog is required | Medium: stale/empty storefront behavior if fallback is added | Test healthy DB, connection refusal, timeout, partial category/product failures |
| No automated test suite is configured | `package.json:4-11`; no tracked test files/config found | No `test` script or installed/configured Jest, Vitest, or Playwright suite | Agree on a test stack and add isolated API/component/E2E coverage before enabling CI gates | Medium: test tooling and fixtures need maintenance; avoid brittle live-service tests | Registration, authz, checkout/payment mocks, CRUD, contact, responsive, API error cases |

## LOW

| Issue | Exact location | Evidence | Recommended fix | Regression risk | Retest |
|---|---|---|---|---|---|
| Duplicate Inquiries admin navigation link | `app/admin/layout.js:15-17` | Two identical Inquiries entries occur in the navigation array | Remove duplicate after owner approval | Low | Verify each admin navigation destination |
| Placeholder footer social URLs | `components/Footer.js:12,17,22,27` | Destinations include `your-handle`, `your-page`, and a zero-filled WhatsApp number | Replace with verified official business destinations or remove unavailable links | Low | Navigate/contact-check each approved destination |
| Contact inputs have no programmatic label association | `components/ContactForm.js:102-164` | Labels lack `htmlFor` and controls lack matching `id`; labels do not wrap inputs | Associate each label with its control | Low | Keyboard, screen-reader accessible names, automated axe check |
| Admin inquiries query is unbounded and errors are not normalized | `app/api/admin/inquiries/route.js:9-16,22-46` | Loads all inquiries; update/delete handlers do not catch malformed-ID/database errors | Add pagination and consistent validation/error responses if operational volume warrants it | Low/medium depending on volume | Large fixture query, invalid ID, missing ID, DB failure, expected 400/404/500 responses |
| Existing staged whitespace issue | `app/api/admin/inquiries/route.js:48` | `git diff --check` reports a blank line at EOF in already-staged work | Clean up only with owner approval because this is pre-existing user work | None for behavior | `git diff --check` |

## Release Gate

Do not declare production readiness until the remaining HIGH transitive `braces` advisory is resolved or explicitly accepted, the open UI/account findings are addressed, and isolated database/auth/payment tests pass. Production Vercel, Atlas, Cloudinary, Razorpay, and performance settings require separate authorized verification.
