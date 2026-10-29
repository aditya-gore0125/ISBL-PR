# PROGRESS

## DONE

### Performance Fixes
- FIX 1: INDEXES — Added compound indexes to `models/Product.js` (`isFeatured+createdAt`, `isNewArrival+createdAt`, `category+type`) and `models/Category.js` (`displayOrder`). Synced to Atlas via `npm run db:indexes`. Verified live on Atlas.
- FIX 2: `.select()` — Added field projections to both `isFeatured` and `isNewArrival` queries in `app/(shop)/page.js`. Dev verified: 4 Bestsellers and 4 New Arrivals render correctly with image, name, price, discount, and action button. Build clean.

### Security Fix: Seed Route Hardening
- Read `app/api/seed/route.js` and `app/api/seed-categories/route.js`. Confirmed no application code imports or calls them.
- Protected both routes: 404 in production, `requireAdmin` check outside production. ESLint and unauthenticated dev tests confirmed 401 response.

### Order, Address & Analytics Hardening
1. **Shipping Address on Pending & Paid Orders**:
   - Added optional `shippingAddress` to `checkoutSchema` in `lib/schemas.js`, reusing `shippingAddressSchema`.
   - Updated `app/(shop)/checkout/page.js` to send `shippingAddress: { ...address }` in the `/api/razorpay/create-order` request.
   - Updated `app/api/razorpay/create-order/route.js` to persist `shippingAddress` on the pending `Order`.
   - Updated `lib/orderFinalize.js` to resolve `finalAddress = shippingAddress || order.shippingAddress`, ensuring saved address is preserved when none is passed (such as webhook-only finalization).
2. **Order History**:
   - Updated `app/api/orders/history/route.js` to filter by `{ user: session.user.id, paymentStatus: 'paid' }`.
3. **Admin Analytics Aggregations**:
   - Updated `app/api/admin/analytics/route.js` to exclude unpaid pending orders from `orderStatuses` and `paymentStatuses` aggregation groups (`$nor: [{ orderStatus: 'pending', paymentStatus: 'pending' }]`).
4. **Dependency Audit**:
   - Executed `npm audit fix` (without `--force`). Re-ran `npm audit` confirming 0 vulnerabilities remain.
5. **Admin Orders Listing Check**:
   - Inspected `app/admin/orders/page.js` and `app/api/admin/orders/route.js`. Confirmed that abandoned pending orders (`orderStatus: 'pending'`, `paymentStatus: 'pending'`) currently **do show** in the default listing when no filters are applied.

### Wishlist Feature
1. **Context & State (`lib/WishlistContext.js`)**:
   - Created localStorage-backed (`nandini-wishlist`), guest-friendly context mirroring `CartContext.js`.
   - Stores `{ productId, slug, name, image, price, discountPrice }`.
   - Provides `toggleWishlist`, `isWishlisted`, `wishlistCount`, `removeFromWishlist`, `clearWishlist`.
   - Wrapped inside `components/Providers.js` alongside `CartProvider`.
   - Handled SSR hydration and try/catch on localStorage interactions.
2. **Button Component (`components/WishlistButton.js`)**:
   - Created client heart button with 44px min tap target (`min-h-11 min-w-11`).
   - Accessible: `aria-pressed`, `aria-label="Add to wishlist"` / `"Remove from wishlist"`.
   - Styling: Filled maroon (`fill-maroon stroke-maroon text-maroon`) when active; outline gold (`stroke-gold`) when inactive.
   - Click isolation (`stopPropagation`) so parent link clicks are not triggered.
3. **Product Card Integration (`components/ProductCard.js`)**:
   - Positioned at top-right of image (`absolute right-2 top-2 z-10`), while Sale badge stays top-left.
   - Product link remains clickable underneath.
4. **Product Detail Page (`components/ProductPurchasePanel.js`, `app/(shop)/product/[slug]/page.js`)**:
   - Added wishlist heart button beside Add to Cart / Buy Now buttons with responsive alignment.
5. **Navbar Integration (`components/Navbar.js`)**:
   - Added heart icon with count badge (`wishlistCount`) between account and cart on desktop and mobile top bar.
   - Added wishlist link with count in mobile slide-out navigation menu.
   - Links to `/wishlist`.
6. **Wishlist Page (`app/(shop)/wishlist/page.js`, `components/WishlistClient.js`)**:
   - Server Component with `robots: { index: false, follow: false }` metadata.
   - Responsive grid displaying saved items, Sale badges, formatted INR pricing, direct Add to Cart button (with feedback), and Remove button.
   - Empty state with custom copy and Continue Shopping link.
7. **Verification**:
   - ESLint: 0 warnings, 0 errors.
   - Build: `npm run build` with dummy env completed cleanly (34 static pages generated).

### Email or Phone Login
1. **Read-Only Audit (`scripts/check-phones.js`)**:
   - Verified active connection name: `test`.
   - 4 total users, 4 with phones, all 4 already clean 10-digit format starting with 6-9.
   - 0 duplicate phones, 0 uppercase emails, 0 pre-existing phone indexes.
2. **Phone Normalization (`lib/phone.js`)**:
   - Created `normalizePhone(input)` stripping non-digits, trimming leading 91 (12 digits) or 0 (11 digits), validating `/^[6-9]\d{9}$/`.
3. **Schemas (`lib/schemas.js`)**:
   - `loginIdentifierSchema`: trims string; validates as email (lowercased) if containing `@`, otherwise requires valid `normalizePhone`. Outputs `{ identifier, type: 'email'|'phone' }`.
   - `credentialSchema` & `credentialFormSchema`: keeps form field key `email`, maps to identifier. `credentialFormSchema` still accepts `redirect`.
   - `optionalPhoneSchema`: trims, normalizes, returns 10 digits or `undefined` if empty/unset. Applied to `signupSchema` and `profileSchema`.
4. **Authentication (`lib/auth.js`)**:
   - Updated `authorize()` to lookup user dynamically by email if `type === 'email'`, otherwise by phone.
   - Kept bcrypt comparison, error handling, shape, and null-returns on bad formats/wrong credentials identical.
5. **Model Index (`models/User.js`)**:
   - Defined `{ phone: 1 }` unique partial index with `{ partialFilterExpression: { phone: { $type: 'string', $gt: '' } } }`. Not run.
6. **Signup & Account Routes**:
   - `app/api/auth/signup/route.js`: Normalizes phone; checks duplicate phone before creation and handles Mongo error code 11000, returning 409 `"This phone number is already registered."`.
   - `app/api/account/route.js`: In PUT handler, checks duplicate phone across other user records and catches code 11000, returning 409 `"This phone number is already registered."`.
7. **UI Updates (Mobile First, 320px checked)**:
   - `app/(shop)/login/page.js`: Updated label to "Email or phone", input `type="text"`, `autoComplete="username"`, updated validation to accept email or normalized mobile.
   - `app/(shop)/signup/page.js`: Phone input updated with `inputMode="tel"`, `maxLength={15}`, hint "10-digit mobile (optional)", inline validation, and server 409 error handling.
8. **Normalization Script (`scripts/normalize-phones.js`)**:
   - Created with dry-run as default and `--apply` flag. Executed in dry-run mode (0 updates needed, 0 collisions).
9. **Verification**:
   - ESLint: 0 warnings, 0 errors.
   - Build: `npm run build` with dummy env passed cleanly (34 static pages generated).

### Hardening & Rate-Limit Refinements
1. **Analytics KPI Grouping**: Fixed `getKpis()` in `app/api/admin/analytics/route.js` by removing `$unwind` before document group and computing `units` via `$reduce`. Aligned KPI totals (?50,578, 10 orders) with timeSeries chart.
2. **NextAuth Rate-Limit Key Normalization**: Updated `app/api/auth/[...nextauth]/route.js` to normalize `form.email` via `normalizePhone` when applicable, collapsing formatting variations of the same phone into a single rate-limit bucket.
3. **Phone Number Enumeration Guard**: Replaced specific duplicate phone error with generic `"This phone number can't be used. Please check it or try a different one."` across signup and account update routes. Duplicate email reporting behavior preserved.
4. **Wishlist Reconcile Analysis**: Confirmed no existing public products endpoint exists to reconcile wishlist items client-side without exposing unauthorized catalog data or creating new endpoints.

## IN PROGRESS
- None. Task complete.

## NEXT
- Await further user instructions.

## KNOWN ISSUES & UNVERIFIED ITEMS
- None.
