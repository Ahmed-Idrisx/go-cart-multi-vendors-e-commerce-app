# Architecture

This document describes GoCart's technical architecture as implemented in the codebase.

---

## High-Level Overview

GoCart is a **multi-vendor e-commerce platform** built as a monolithic Next.js 16 application using the App Router. It serves three user roles through a single deployment:

```
┌──────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                        │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Customer  │  │   Seller   │  │  Admin   │  │  Clerk Auth  │  │
│  │  Pages    │  │ Dashboard  │  │Dashboard │  │   (SSO)      │  │
│  └─────┬────┘  └─────┬──────┘  └────┬─────┘  └──────┬───────┘  │
│        │              │              │               │          │
│  ┌─────┴──────────────┴──────────────┴───────────────┘          │
│  │              Redux Toolkit Store                              │
│  │   (cart, wishlist, product, address, rating slices)           │
│  └─────────────────────┬────────────────────────────┘           │
└────────────────────────┼────────────────────────────────────────┘
                         │ fetch() calls
┌────────────────────────┼────────────────────────────────────────┐
│                    Next.js API Routes                            │
│  ┌──────┐ ┌────────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌───────┐ │
│  │ cart │ │wishlist│ │orders │ │rating │ │address │ │coupon │  │
│  ├──────┤ ├────────┤ ├───────┤ ├───────┤ ├────────┤ ├───────┤  │
│  │store/│ │admin/  │ │stripe │ │products│                      │
│  └──┬───┘ └───┬────┘ └───┬───┘ └───┬───┘                      │
│     │         │          │         │                            │
│  ┌──┴─────────┴──────────┴─────────┴──┐  ┌──────────────────┐  │
│  │     Prisma ORM (Neon Adapter)      │  │   Middlewares     │  │
│  │         prisma.*.findMany()        │  │  authAdmin()      │  │
│  │         prisma.*.create()          │  │  authSeller()     │  │
│  └──────────────┬─────────────────────┘  └──────────────────┘  │
└─────────────────┼──────────────────────────────────────────────┘
                  │
┌─────────────────┼──────────────────────────────────────────────┐
│          External Services                                      │
│  ┌──────────┐ ┌───────┐ ┌────────┐ ┌────────┐ ┌────────────┐  │
│  │PostgreSQL│ │ Clerk │ │ Stripe │ │ImageKit│ │  Inngest   │   │
│  │  (Neon)  │ │ Auth  │ │Payments│ │ Images │ │ Background │   │
│  └──────────┘ └───────┘ └────────┘ └────────┘ └────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

### Route Groups

GoCart uses Next.js **route groups** to apply different layouts without affecting the URL:

| Group | Layout | Purpose |
|---|---|---|
| `app/(public)/` | `Banner` + `Navbar` + `AppInitializer` + `Footer` | Customer-facing pages |
| `app/admin/` | Admin sidebar layout with `authAdmin` guard | Admin dashboard |
| `app/store/` | Seller sidebar layout with `authSeller` guard | Seller dashboard |

### Key Directories

```
lib/features/     → Redux slices (one per domain)
lib/prisma.ts     → Prisma client singleton with Neon WebSocket adapter
middlewares/      → Server-side auth: authAdmin.ts, authSeller.ts
inngest/          → Background job functions (Clerk sync, coupon expiry)
configs/          → External SDK configs (ImageKit)
hooks/            → Typed Redux hooks (useAppDispatch, useAppSelector)
types/            → Centralized TypeScript interfaces
store/            → Redux store factory (makeStore / getStore pattern)
```

---

## Data Flow

### Client-Side State (Redux)

GoCart uses a **5-slice Redux store**, initialized on app mount via `AppInitializer.tsx`:

```
AppInitializer (runs once when user is present)
  ├── dispatch(fetchProducts({}))     → GET /api/products
  ├── dispatch(fetchCart())           → GET /api/cart
  ├── dispatch(fetchWishlist())       → GET /api/wishlist
  ├── dispatch(fetchAddress())        → GET /api/address
  └── dispatch(fetchRatings())        → GET /api/rating
```

**Store shape:**

```typescript
RootState = {
  cart:     { cartItems: Record<string, number>, total, loading, error, isFetched }
  wishlist: { wishlistItems: Record<string, boolean>, total, loading, error, isFetched }
  product:  { list: Product[], loading, error }
  address:  { list: Address[], loading, error }
  rating:   { ratings: Rating[], loading, error }
}
```

**Redux → API sync patterns:**

| Slice | Read | Write |
|---|---|---|
| `cart` | `fetchCart` thunk on init | Optimistic local update → debounced `uploadCart` thunk (1 s delay) |
| `wishlist` | `fetchWishlist` thunk on init | `toggleWishlistItem` thunk (immediate POST → update state on response) |
| `product` | `fetchProducts` thunk on init | Server-side only (seller API routes) |
| `address` | `fetchAddress` thunk on init | Direct POST from `AddressModal` → `addAddress` reducer |
| `rating` | `fetchRatings` thunk on init | Direct POST from `RatingModal` → `addRating` reducer |

### Server-Side Data Access

All API routes use the **Prisma ORM** through a singleton client (`lib/prisma.ts`) configured with:
- `@prisma/adapter-neon` for serverless PostgreSQL
- WebSocket connection via the `ws` package
- `poolQueryViaFetch = true` for edge compatibility

### Authentication Flow

```
Request → Clerk auth() → userId
  ├── Customer routes: userId used directly for Prisma queries
  ├── Seller routes:   userId → authSeller(userId) → storeId or false
  └── Admin routes:    userId → authAdmin(userId) → checks ADMIN_EMAIL env list
```

- `authAdmin` resolves the Clerk user by ID, compares their primary email against the `ADMIN_EMAIL` comma-separated env var
- `authSeller` queries Prisma for a `Store` with matching `userId` and `status === "approved"`, returns the `storeId`

---

## Component Architecture

### Layout Hierarchy

```
RootLayout (app/layout.tsx)
  └── ClerkProvider
       └── ThemeProvider (next-themes)
            └── StoreProvider (Redux)
                 └── Toaster (react-hot-toast)
                      └── children

PublicLayout (app/(public)/layout.tsx)
  ├── Banner
  ├── Navbar        ← reads cart.total & wishlist.total from Redux
  ├── AppInitializer ← dispatches all fetch thunks on mount
  ├── {children}
  └── Footer
```

### Key Components

| Component | Type | Description |
|---|---|---|
| `AppInitializer` | Client | Dispatches fetch thunks for cart, wishlist, products, addresses, ratings on mount |
| `Navbar` | Client | Navigation with search, cart/wishlist badge counts from Redux, Clerk UserButton |
| `ProductCard` | Server | Product card with image, name, rating stars, price, `WishlistButton` |
| `WishlistButton` | Client | ❤️ toggle — reads `state.wishlist.wishlistItems[productId]`, dispatches `toggleWishlistItem` |
| `Counter` | Client | +/- quantity buttons — dispatches `addToCart` / `removeFromCart` |
| `OrderSummary` | Client | Cart totals, coupon application, address selection, payment method, checkout |
| `AddressModal` | Client | Dialog form to add a new shipping address via POST `/api/address` |
| `RatingModal` | Client | Star rating + review form tied to a specific order and product |
| `PageTitle` | Server | Reusable heading with optional "Continue Shopping" link |

---

## External Service Integration

### Clerk → Inngest → Prisma (User Sync)

Clerk fires webhook events when users are created/updated/deleted. Inngest functions (`inngest/functions.ts`) consume these events and sync the data to the Prisma `User` table:

```
Clerk webhook → Inngest event bus
  ├── clerk/user.created  → syncUserCreation  → prisma.user.create()
  ├── clerk/user.updated  → syncUserUpdation  → prisma.user.update()
  └── clerk/user.deleted  → syncUserDeletion  → prisma.user.delete()
```

### Stripe Payment Flow

```
OrderSummary (client) → POST /api/orders (paymentMethod: "STRIPE")
  → Creates Order records in DB (isPaid: false)
  → Creates Stripe Checkout Session with orderIds in metadata
  → Returns session → client redirects to Stripe Checkout

Stripe webhook → POST /api/stripe
  ├── payment_intent.succeeded → marks orders isPaid=true, clears cart
  └── payment_intent.canceled  → deletes unpaid orders from DB
```

### ImageKit (Image Uploads)

Used in two places:
- **Store creation** (`/api/store/create`): Logo upload → optimized to WebP, width 512px
- **Product creation** (`/api/store/product`): Multi-image upload → optimized to WebP, width 1024px

All uploads go through the server-side ImageKit SDK (`configs/imageKit.ts`), not client-side.

### Inngest (Background Jobs)

Two categories of jobs:
1. **User sync** (3 functions): Clerk webhook → Prisma user CRUD
2. **Coupon expiry** (1 function): When admin creates a coupon, an Inngest event is sent with the expiry date; the function `sleepUntil` the expiry, then deletes the coupon from the database

---

## Recommendations

1. **API validation**: Consider adding a schema validation library (Zod) for request body validation instead of manual `if (!field)` checks
2. **Error handling**: Standardize error response shape — currently mixes `{ error: string }` with Prisma error codes
3. **Middleware consolidation**: The `authAdmin` and `authSeller` functions could be unified into a single `authorize(role)` higher-order function
4. **Product image cleanup**: Currently, deleting a product does not remove images from ImageKit — this should be handled
5. **Pagination**: Product and order lists are fetched without limit/offset — will need pagination as data grows
6. **Environment variable validation**: Add runtime validation (e.g., `zod` schema) for required env vars at startup
