# Roadmap

Planned improvements and future features for GoCart, organized by priority and category.

---

## 🟢 Short-Term (Next Release)

### Features

- [ ] **Product editing** — Sellers can currently only add products; add edit/delete functionality via `PATCH /api/store/product` and `DELETE /api/store/product`
- [ ] **Product image management** — Delete old images from ImageKit when products are updated or removed
- [ ] **Pagination** — Add cursor-based pagination to `GET /api/products`, `GET /api/orders`, `GET /api/store/orders`, and `GET /api/admin/stores`
- [ ] **Product sorting** — Sort by price, date added, popularity (rating count), and rating
- [ ] **Price range filter** — Filter products by min/max price on the shop page

### Technical Improvements

- [ ] **Input validation** — Add Zod schemas to all API route request bodies (currently using manual `if (!field)` checks)
- [ ] **Error response standardization** — Unify all API error responses to `{ error: string, code?: string }` format
- [ ] **Database indexes** — Add indexes on `Order.userId`, `Order.storeId`, `Product.storeId`, `Rating.productId`
- [ ] **Address deletion** — Add `DELETE /api/address` endpoint (currently addresses can only be added)

---

## 🟡 Medium-Term

### Features

- [ ] **Order notifications** — Email notifications for order confirmation, shipping updates, and delivery (SendGrid or Resend)
- [ ] **Real-time order tracking** — WebSocket or Server-Sent Events for live order status updates
- [ ] **Category management** — Normalize `Product.category` into a `Category` model for consistent filtering and admin management
- [ ] **Product search** — Full-text search with Algolia, Meilisearch, or PostgreSQL `tsvector`
- [ ] **Multi-category filtering** — Allow filtering products by multiple categories simultaneously
- [ ] **Order cancellation** — Allow customers to cancel orders in `ORDER_PLACED` status
- [ ] **Invoice generation** — PDF invoice generation for completed orders

### Technical Improvements

- [ ] **Automated testing** — Unit tests for Redux slices (Jest), API endpoint tests, E2E tests (Playwright) for critical flows
- [ ] **CI/CD pipeline** — GitHub Actions for lint, type-check, tests, and Vercel preview deployments
- [ ] **Error monitoring** — Integrate Sentry for production error tracking and alerting
- [ ] **Rate limiting** — Add rate limiting to API routes (especially auth, coupon verification, and order placement)
- [ ] **Structured logging** — Replace `console.error` with Pino or Winston for structured, queryable logs
- [ ] **Migration workflow** — Transition from `prisma db push` to `prisma migrate` for production schema changes

---

## 🔴 Long-Term

### Features

- [ ] **Multi-language support (i18n)** — Arabic and English with RTL layout support
- [ ] **PWA support** — Service worker, offline mode, push notifications for mobile experience
- [ ] **Social login** — Google, GitHub, Apple via Clerk social connections
- [ ] **Product comparison** — Side-by-side comparison of up to 3 products
- [ ] **Seller analytics** — Advanced charts: revenue over time, top products, conversion rates (Recharts)
- [ ] **Admin analytics** — Per-store revenue breakdown, category-level metrics, user growth chart
- [ ] **Delivery tracking integration** — Third-party logistics API integration
- [ ] **Inventory management** — Stock quantity tracking with low-stock alerts
- [ ] **Refunds** — Stripe refund integration for returned/canceled orders
- [ ] **Customer support** — In-app chat or ticketing system

### Performance Optimizations

- [ ] **Caching layer** — Redis or Next.js `unstable_cache` for product listings and dashboard metrics
- [ ] **Image lazy loading** — Progressive image loading with blur placeholders
- [ ] **ISR (Incremental Static Regeneration)** — Static generation for product pages with on-demand revalidation
- [ ] **Bundle optimization** — Analyze and reduce client-side bundle size with `@next/bundle-analyzer`
- [ ] **Database connection pooling** — Evaluate PgBouncer or Neon's built-in pooling configuration

### Security Enhancements

- [ ] **CSRF protection** — Add CSRF tokens for state-changing API routes
- [ ] **Content Security Policy** — Configure CSP headers via `next.config.ts`
- [ ] **Input sanitization** — Sanitize HTML in product descriptions and reviews
- [ ] **Webhook signature verification** — Verify Inngest webhook signatures in production
- [ ] **Environment variable validation** — Runtime validation of required env vars at startup (Zod)
- [ ] **Audit logging** — Log admin actions (store approval, coupon creation, store toggle)

---

## Completed ✅

### v1.0.0

- [x] Product browsing with ratings and store info
- [x] Shopping cart with Redux + debounced API sync
- [x] Wishlist with toggle behavior and "Move to Cart"
- [x] Multi-vendor order splitting
- [x] Stripe payment integration with webhook handling
- [x] COD payment support
- [x] Coupon system (public, new-user, member-only) with auto-expiry
- [x] Seller store application with admin approval workflow
- [x] Product management with ImageKit image uploads
- [x] Order status management for sellers
- [x] Admin dashboard with platform metrics and revenue chart
- [x] Clerk authentication with Inngest user sync
- [x] Dark mode with system-aware detection
- [x] Responsive design (mobile + desktop)
