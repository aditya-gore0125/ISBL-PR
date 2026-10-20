# Security Audit

**Date:** 2026-10-20
**Approach:** Full tracked-source security review plus dependency scans. Initial inspection was read-only. After findings were presented, the user approved dependency and authorization remediation. No live service, production database, real payment, or secret value was accessed.

## Findings and Remediation Status

### S-01 — Admin role revocation delay — REMEDIATED BY CODE CHANGE

- **Severity:** MEDIUM
- **Confidence:** 9/10
- **Files:** `lib/auth.js`, `app/admin/layout.js:20-21`, `lib/requireAdmin.js`
- **Category:** Broken access control / stale authorization state
- **Initial evidence:** The JWT callback refreshes `token.role` only after its five-minute refresh interval. The admin layout trusted `session.user.role`, and the inquiries page queried contact data without a separate database-backed role check.
- **Change:** The admin layout now calls `requireAdmin()`, which checks the current database role before rendering the admin route tree. Admin APIs already used this check.
- **Validation:** The code path is corrected by inspection and `npm run build` passes. Runtime role demotion and database-failure behavior remain untested because no isolated database/admin account was available.

### S-02 — Critical locked Next.js advisories — REMEDIATED

- **Severity:** CRITICAL (npm audit)
- **Affected package:** `next@15.5.28` (updated from 14.2.35)
- **Evidence:** Post-remediation `npm audit` no longer reports Next.js; the final direct-dependency CVE assessment found no known CVEs. The Next.js 15 production build and lint pass.
- **Validation limits:** Live deployment, middleware edge behavior, and production image optimization were not tested.

### S-03 — Critical locked Mongoose advisories and lockfile mismatch — REMEDIATED

- **Severity:** CRITICAL (npm audit)
- **Affected package:** `mongoose@7.8.11` in `package.json` and `package-lock.json` (updated from locked 7.5.1)
- **Evidence:** Manifest and lockfile now agree; `npm audit` and the final direct-dependency CVE assessment no longer report Mongoose advisories.
- **Validation limits:** No database CRUD, query, or transaction test was run because an isolated test database was unavailable.

### S-04 — High Cloudinary SDK advisory — REMEDIATED

- **Severity:** HIGH (npm audit)
- **Affected package:** `cloudinary@2.11.0` (updated from 1.41.3)
- **Evidence:** `npm audit` and the final direct-dependency CVE assessment no longer report Cloudinary advisories. The production build passes.
- **Validation limits:** No Cloudinary account or non-production upload credentials were available; upload behavior and response shape were not exercised.

### S-05 — `braces` nested dependency DoS advisory — UNRESOLVED

- **Severity:** HIGH (npm audit)
- **Affected dependency path:** `eslint-config-next@15.5.28` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces@3.0.3`
- **Evidence:** Final `npm audit` exits 1 with five HIGH package entries associated with this one advisory. The npm registry currently has no patched compatible `braces` 3.x release. `npm audit fix --force` recommends downgrading `eslint-config-next` to 14.2.35, which would mismatch the installed Next.js 15 framework.
- **Exposure:** The dependency is in the lint/build toolchain rather than the application runtime. The advisory concerns deeply nested patterns; no application request input reaches this glob matcher in the reviewed usage.
- **Recommendation:** Keep the compatible Next 15 lint configuration; re-evaluate when upstream publishes a patched dependency. Do not force an unsupported downgrade or replace a transitive package with an incompatible major version.
- **Regression considerations:** Any upstream update must be followed by lint/build checks. The remaining audit finding is a release risk despite its development-tool exposure.

## Dependency Scan Detail

The initial `npm audit` exited 1 with **19 vulnerable package entries**: 2 critical, 15 high, and 2 moderate. After approved upgrades and patched transitive overrides, the final `npm audit` exits 1 with **5 HIGH package entries**, all associated with the same unresolved `braces@3.0.3` transitive toolchain advisory. There are no remaining critical or moderate npm audit findings. A separate final CVE assessment of all 16 declared direct dependencies found no known CVEs.

| Scan | Result |
|---|---|
| Initial `npm audit` | 19 entries: 2 critical, 15 high, 2 moderate |
| Final `npm audit` | 5 high package entries from one `braces@3.0.3` advisory |
| Final direct-dependency CVE assessment | No known CVEs in 16 declared direct dependencies |

Approved updates: Next.js/React 15.5.28/19.3.1; Tailwind CSS and `@tailwindcss/postcss` 4.3.3; Cloudinary 2.11.0; Mongoose 7.8.11; PostCSS 8.5.31; source-map-js 1.2.2. `npm audit fix --force` was not run.

## Other Security Controls Observed

- NextAuth uses JWT sessions with a seven-day max age and bcrypt password hashing.
- Signup and sensitive request bodies use Zod validation; malformed JSON probes returned 400.
- Three selected unauthenticated API probes returned 401.
- Server-side checkout recomputes price from stored product data, checks Razorpay order amount, and verifies payment signatures using HMAC plus constant-time comparison.
- The webhook validates its signature before parsing/updating orders; no event was sent or replayed.
- Admin APIs and the admin layout call `requireAdmin()`, which checks the current database role.
- Upload route requires admin auth and checks image content type and a 10MB size cap; no upload was attempted.
- CSP and standard security headers are configured in `next.config.js`. Production header delivery was not verified.
- Rate limits use process-local memory without both Upstash settings. The README documents that this does not provide reliable cross-instance enforcement on Vercel; production Upstash configuration was not verified.
- `.env.local` is ignored and was not read. The tracked `.env.local.example` contains placeholders. A bounded scan found no common live-key/credential URI patterns in tracked files or commit paths; this is not an exhaustive secret history scan.

## Unverified

No production settings, deployment URL, proxy behavior, CORS policy at the edge, Atlas network/access controls, session cookie attributes in production, test Razorpay account, Cloudinary account, or webhook secret were available for verification. No live exploit attempt or intrusive scan was performed.
