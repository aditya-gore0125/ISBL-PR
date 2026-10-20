# Performance Report

**Date:** 2026-10-20
**Environment:** Local optimized Next.js build and browser; MongoDB intentionally pointed to an unreachable loopback port. No production or field performance endpoint was available.

## Measurements

### Production build output

The post-remediation `npm run build` completed successfully. Next.js 15.5.28 reported:

- Shared first-load JavaScript: **103 kB**
- Route first-load JavaScript: approximately **103–125 kB**
- Middleware bundle: **56.8 kB**
- 30 static pages generated
- Heaviest reported first-load routes included `/account` at 125 kB, `/checkout` at 122 kB, and `/product/[slug]` at 116 kB.

Compared with the pre-upgrade build, shared first-load JavaScript increased from 87.3 kB to 103 kB and middleware from 48.6 kB to 56.8 kB. These figures are not compressed transfer sizes or browser performance measurements; the causes and user impact were not isolated.

These are Next build-reported sizes, not compressed transfer sizes or observed user performance. No bundle analyzer was installed.

### Browser layout and images

- `/collections`: rechecked after the framework/CSS upgrade; no horizontal overflow at 320, 375, 425, 768, 1024, 1440, and 1920px.
- `/contact`: overflow persists at 320px only. The document client width was 305px; document/card content extends to 326px. At the other six widths the page did not overflow.
- In the initial audit, `/collections` contained 18 image elements with no completed broken-image state. The mobile navigation was rechecked after the upgrades at 320px; it opened and showed its About and Contact links.
- Tailwind 4 was adopted with the user's approval of its documented minimums: Safari 16.4+, Chrome 111+, and Firefox 128+.

### Runtime performance metrics

| Metric | Result |
|---|---|
| FCP | NOT MEASURED |
| LCP | NOT MEASURED |
| CLS | NOT MEASURED |
| INP | NOT MEASURED |
| TTFB | NOT MEASURED |
| Production API latency | NOT MEASURED |
| MongoDB query latency | NOT MEASURED |
| Lighthouse score | NOT RUN |

The local browser was not a production deployment and had no connected database. Development-server observations are not suitable substitutes for production Core Web Vitals.

## Performance-Relevant Source Findings

- Home page limits featured and new-arrival queries to four each.
- Search results are limited to 24 products; category listing uses pagination and a page size.
- Related products are limited to four.
- Admin order search supports pagination (default 20, max 100).
- Admin inquiries loads the full inquiry collection without pagination; this is an unmeasured growth risk.
- Mongoose connection reuse is implemented at process scope with pool and timeout limits.
- Next image optimization is configured for Cloudinary, Unsplash, and placeholder image hosts. Real catalog-image transfer, cache behavior, and resizing were not benchmarked.

## Recommendations

1. Establish production-like baseline measurements in an authorized preview deployment with representative products and safe test data.
2. Record Lighthouse and field Core Web Vitals at mobile and desktop viewports; compare image loads and font/layout shifts.
3. Add pagination to the inquiry dashboard if inquiry volume can grow materially.
4. Profile real search/catalog query plans and verify indexes with an isolated dataset before changing indexes.
5. Re-run bundle analysis after dependency remediation; do not infer user impact from build-size figures alone.
