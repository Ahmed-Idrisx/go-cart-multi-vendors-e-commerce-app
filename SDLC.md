# Software Development Life Cycle (SDLC)

This document maps GoCart's development lifecycle to the actual project artifacts, decisions, and technical implementations.

---

## 1. Requirements

### Functional Requirements (Implemented)

| Requirement | Implementation |
|---|---|
| Users can browse products | `GET /api/products` → `ProductCard`, `/shop` page |
| Users can search products | Navbar search form → `/shop?search=query` |
| Users can add products to cart | Redux `addToCart` action → debounced `uploadCart` thunk |
| Users can manage a wishlist | Redux `toggleWishlistItem` thunk → `POST /api/wishlist` |
| Users can place orders (COD + Stripe) | `POST /api/orders` with multi-vendor splitting |
| Users can track orders | `GET /api/orders` → `/orders` page with status badges |
| Users can rate products | `POST /api/rating` tied to `orderId` (verified purchase) |
| Users can manage addresses | `POST/GET /api/address` → `AddressModal` component |
| Sellers can create stores | `POST /api/store/create` with ImageKit logo upload |
| Sellers can manage products | `POST /api/store/product`, `POST /api/store/stock-toggle` |
| Sellers can manage orders | `POST /api/store/orders` (status updates) |
| Admins can approve stores | `POST /api/admin/approve-store` |
| Admins can manage coupons | CRUD via `/api/admin/coupon` + Inngest expiry job |
| Admins can view platform metrics | `GET /api/admin/dashboard` → Recharts visualization |

### Non-Functional Requirements (Implemented)

| Requirement | Implementation |
|---|---|
| Authentication | Clerk (SSO, session management, user profiles) |
| Authorization | `authAdmin` (email-based), `authSeller` (store-ownership) |
| Payment Security | Stripe Checkout (PCI compliance handled by Stripe) |
| Dark Mode | `next-themes` with system-aware detection |
| Image Optimization | ImageKit (auto WebP, quality=auto, width constraints) |
| Type Safety | TypeScript end-to-end (228 lines of types in `types/types.ts`) |

---

## 2. Planning

### Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | Server + client components, API routes, SSR |
| State Management | Redux Toolkit | Complex client state (cart, wishlist) with server sync |
| Database | PostgreSQL (Neon) | Relational data with complex joins; serverless for cost |
| ORM | Prisma 6 | Type-safe queries, schema-as-code, migration tooling |
| Auth | Clerk | SSO, user management, membership plans, webhooks |
| Payments | Stripe | Industry standard, webhook-driven payment confirmation |
| Image CDN | ImageKit | Upload + optimize + deliver in one SDK |
| Background Jobs | Inngest | Event-driven functions for Clerk sync + coupon expiry |

### Project Structure Decision

The project uses a **monolithic architecture** — all three user interfaces (customer, seller, admin) and all API routes live in a single Next.js app. This was chosen for simplicity at this project scale.

**Route organization:**
- `app/(public)/` — Customer pages (route group with Navbar/Footer layout)
- `app/admin/` — Admin dashboard (separate sidebar layout)
- `app/store/` — Seller dashboard (separate sidebar layout)
- `app/api/` — 11 API route groups (flat structure)

---

## 3. Design

### Database Design

9 Prisma models designed for a multi-vendor marketplace:
- `User` ↔ `Store` (1:1) — each user can own one store
- `Store` ↔ `Product` (1:N) — stores have multiple products
- `Order` splits by `storeId` — one order per vendor per checkout
- `OrderItem` uses composite PK `[orderId, productId]`
- `Rating` uses unique constraint `[userId, productId, orderId]` — one review per purchase
- `cart` and `wishlist` stored as JSON on User — avoids join tables for frequently-accessed data

See [DATABASE.md](./DATABASE.md) for full schema documentation.

### Component Design

Reusable component strategy:
- `ProductCard` — used on shop page, wishlist page, and store pages
- `Counter` — quantity +/- used on cart page and product details
- `PageTitle` — consistent heading used across cart, wishlist, and other pages
- `WishlistButton` — ❤️ toggle embedded in `ProductCard`, reads from Redux
- `OrderSummary` — checkout component handling coupons, addresses, and payment

### State Design

5 Redux slices with a consistent pattern:
```
Each slice: { data, loading, error, isFetched? }
Fetch thunk: createAsyncThunk → GET /api/...
Write thunk: createAsyncThunk → POST /api/...
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed data flow.

---

## 4. Development

### Development Environment

```bash
npm install           # Install deps (postinstall runs prisma generate)
npx prisma db push    # Push schema to database
npm run dev           # Start Next.js dev server (http://localhost:3000)
```

### Code Conventions

| Convention | Example |
|---|---|
| Component files | PascalCase: `ProductCard.tsx`, `OrderSummary.tsx` |
| Redux slices | camelCase: `cartSlice.ts`, `wishlistSlice.ts` |
| API routes | Kebab-case directories: `approve-store/`, `stock-toggle/` |
| Types | Centralized in `types/types.ts` with section comments |
| Hooks | Typed in `hooks/hooks.ts`: `useAppDispatch`, `useAppSelector` |
| Middleware | Functions in `middlewares/`: `authAdmin.ts`, `authSeller.ts` |

### Key Libraries

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.9 | Framework |
| `react` | 19.2.4 | UI library |
| `@reduxjs/toolkit` | 2.12.0 | State management |
| `@prisma/client` | 6.14.0 | Database ORM |
| `@clerk/nextjs` | 6.31.4 | Authentication |
| `stripe` | 22.2.1 | Payments |
| `imagekit` | 6.0.0 | Image uploads |
| `inngest` | 3.40.1 | Background jobs |
| `recharts` | 3.8.1 | Charts |
| `lucide-react` | 1.20.0 | Icons |

---

## 5. Testing

### Current State

> **Note:** The project does not currently have automated tests. Testing is performed manually.

### Manual Test Scenarios (as performed during development)

| Flow | Verification |
|---|---|
| Sign up → browse → add to cart → checkout (COD) | Order appears in `/orders` |
| Sign up → browse → add to cart → checkout (Stripe) | Stripe Checkout → webhook → order `isPaid: true` |
| Toggle wishlist → move to cart | Product moves from wishlist page to cart |
| Create store → submit → admin approval | Store status changes from `pending` → `approved` |
| Seller adds product → toggle stock | Product appears/disappears from shop |
| Admin creates coupon → customer applies it | Discount reflected in order total |
| Coupon expiry | Inngest job deletes coupon after `expiresAt` |

### Recommended Testing Strategy

| Layer | Tool | Coverage |
|---|---|---|
| Unit tests | Jest + React Testing Library | Redux slices, utility functions, components |
| API tests | Jest + Supertest (or Playwright API) | All 28 API endpoints |
| E2E tests | Playwright | Critical user flows (cart → checkout → order) |
| Visual regression | Playwright screenshots | Key pages across themes |

---

## 6. Deployment

### Build Process

```bash
npm run build
# Runs: prisma generate && next build
```

The `postinstall` script ensures `prisma generate` runs automatically during `npm install` on the deployment server.

### Deployment Platform

**Vercel** (recommended):
1. Connect GitHub repository
2. Set all environment variables from `.env.example`
3. Vercel runs `npm install` → `postinstall` → `npm run build` automatically
4. Configure Stripe webhook: `https://your-domain.com/api/stripe`
5. Configure Clerk webhook (Inngest): for `user.created`, `user.updated`, `user.deleted` events

### Environment Variables Required

12 environment variables across 6 services — see [`.env.example`](./.env.example) for the complete list.

### Infrastructure

| Component | Service | Tier |
|---|---|---|
| Application | Vercel | Serverless functions |
| Database | Neon PostgreSQL | Serverless (auto-scaling) |
| Auth | Clerk | Cloud-hosted |
| Payments | Stripe | Cloud-hosted |
| Images | ImageKit | CDN |
| Jobs | Inngest | Cloud-hosted |

---

## 7. Maintenance

### Monitoring (Current)

- `console.error` in all API route catch blocks — visible in Vercel function logs
- Stripe webhook errors return 500 with error details
- Prisma error codes propagated in API responses

### Database Maintenance

```bash
# Apply schema changes
npx prisma db push

# View database in browser
npx prisma studio

# Generate client after schema changes
npx prisma generate
```

### Updating Dependencies

```bash
npm outdated        # Check for updates
npm update          # Update within semver ranges
npx prisma migrate  # After Prisma version updates
```

---

## Recommendations

1. **Add automated tests**: Start with Redux slice unit tests and critical-path E2E tests (cart → checkout)
2. **CI/CD pipeline**: Add GitHub Actions for lint (`npm run lint`), type-check (`tsc --noEmit`), and test runs
3. **Error monitoring**: Integrate Sentry or similar for production error tracking
4. **Logging**: Replace `console.error` with a structured logger (Pino or Winston)
5. **Performance monitoring**: Add Vercel Analytics or custom Web Vitals tracking
6. **Database migrations**: Transition from `prisma db push` to `prisma migrate` for production-safe schema changes
