# System Design

This document describes the high-level system design and key user flows in GoCart, derived from the actual codebase.

---

## High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │
│  │  Public UI   │ │ Seller UI   │ │      Admin UI         │ │
│  │  (Next.js    │ │ (Next.js    │ │   (Next.js App        │ │
│  │  App Router) │ │ App Router) │ │      Router)          │ │
│  └──────┬───────┘ └──────┬──────┘ └──────────┬────────────┘ │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴───────────┐ │
│  │                Redux Toolkit Store                      │ │
│  │  cart | wishlist | product | address | rating           │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP (fetch)
┌───────────────────────────┼─────────────────────────────────┐
│                   Next.js Server                             │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  API Route        │  │  Server Components               │ │
│  │  Handlers         │  │  (product/[id], admin pages)     │ │
│  └────────┬──────────┘  └──────────────┬──────────────────┘ │
│           │                            │                     │
│  ┌────────┴────────────────────────────┴──────────────────┐ │
│  │               Prisma ORM (Neon Adapter)                │  │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────┐ ┌────────┴───┐ ┌──────────┐ ┌───────────┐  │
│  │ authAdmin  │ │ authSeller │ │ ImageKit │ │  Inngest  │   │
│  │ middleware │ │ middleware │ │   SDK    │ │  Client   │   │
│  └────────────┘ └────────────┘ └──────────┘ └───────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                  External Services                           │
│                                                              │
│   PostgreSQL      Clerk       Stripe      ImageKit   Inngest │
│    (Neon)         Auth       Payments      CDN       Jobs    │
└──────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Sign-Up / Sign-In

```
User → Clerk Hosted UI (/sign-in, /sign-up)
  → Clerk creates session + JWT
  → Clerk fires webhook: clerk/user.created
  → Inngest receives event
  → syncUserCreation function runs:
      prisma.user.create({
        id: clerkUserId,
        name, email, image
      })
  → User now exists in both Clerk and Prisma DB
```

### Route Protection

```
API Request
  → auth() from @clerk/nextjs/server
  → Returns { userId } (null if unauthenticated)
  │
  ├── Public endpoints (GET /api/products): No auth required
  ├── Customer endpoints: Check userId !== null
  ├── Seller endpoints: authSeller(userId)
  │     → Queries prisma.user with store relation
  │     → Returns storeId if store.status === "approved"
  │     → Returns false otherwise
  └── Admin endpoints: authAdmin(userId)
        → Fetches Clerk user by ID
        → Checks primary email against ADMIN_EMAIL env var
        → Returns boolean
```

### User Update / Deletion

```
User updates profile in Clerk
  → Clerk fires: clerk/user.updated
  → Inngest → syncUserUpdation → prisma.user.update()

User deletes account in Clerk
  → Clerk fires: clerk/user.deleted
  → Inngest → syncUserDeletion → prisma.user.delete()
```

---

## Order Flow

### Placing an Order (POST /api/orders)

```
Customer selects items in cart
  → Fills address (AddressModal)
  → Optionally enters coupon code (verified via POST /api/coupon)
  → Selects payment method: COD or STRIPE
  → Clicks "Place Order"

POST /api/orders:
  1. Authenticate user (Clerk auth())
  2. Validate: addressId, items[], paymentMethod required
  3. If couponCode:
     a. Find coupon in DB
     b. Check expiry
     c. If forNewUser: verify user has no prior orders
     d. If forMember: verify user has Clerk "plus" plan
  4. Group items by storeId (multi-vendor split)
  5. For each store group:
     a. Calculate subtotal = Σ(price × quantity)
     b. Apply coupon discount (percentage)
     c. Add $5 shipping if NOT Plus member (once only)
     d. Create Order record with nested OrderItems
  6. If paymentMethod === "STRIPE":
     a. Create Stripe Checkout Session
     b. Set metadata: { orderIds, userId, appId }
     c. Set success_url: /orders, cancel_url: /cart
     d. Return session to client → redirect to Stripe
  7. If paymentMethod === "COD":
     a. Clear user cart (prisma.user.update → cart: {})
     b. Return success message
```

### Multi-Vendor Order Splitting

When a cart contains products from multiple stores, the system creates **separate Order records per store**, each with its own total. This is done in the `ordersByStore` Map grouping logic.

### Order Status Lifecycle

```
ORDER_PLACED → PROCESSING → SHIPPED → DELIVERED
```

Status updates are managed by sellers via `POST /api/store/orders`.

---

## Cart & Wishlist Flow

### Cart

```
Cart Data Model: user.cart = { [productId]: quantity }

Add to Cart (client):
  1. dispatch(addToCart({ productId }))  → Redux updates instantly
  2. useEffect on cartItems change triggers dispatch(uploadCart())
  3. uploadCart is debounced (1 second clearTimeout pattern)
  4. POST /api/cart with full cart object → prisma.user.update()

Remove from Cart:
  Same pattern — dispatch(removeFromCart/deleteItemFromCart) → debounced upload

Fetch Cart (on init):
  dispatch(fetchCart()) → GET /api/cart → state populated
```

### Wishlist

```
Wishlist Data Model: user.wishlist = { [productId]: true }

Toggle Wishlist (WishlistButton click):
  1. dispatch(toggleWishlistItem({ productId }))
  2. Thunk: POST /api/wishlist → server toggles in DB
  3. Response: { inWishlist: boolean }
  4. Redux state updated in extraReducers on fulfilled

Move to Cart (Wishlist page):
  1. dispatch(addToCart({ productId }))
  2. dispatch(uploadCart())
  3. dispatch(toggleWishlistItem({ productId }))  → removes from wishlist
```

---

## Payment Flow

### Stripe Integration

```
┌──────────┐     POST /api/orders      ┌──────────────┐
│  Client  │ ──────────────────────────→│ Next.js API  │
│          │                            │              │
│          │     { session }            │  Creates     │
│          │ ←──────────────────────────│  Stripe      │
│          │                            │  Session     │
│          │                            └──────────────┘
│          │
│          │  Redirect to session.url
│          │ ─────────────────────────→ Stripe Checkout
│          │
│          │  On success: redirect to /orders
│          │  On cancel: redirect to /cart
└──────────┘

Stripe webhook → POST /api/stripe:
  1. Verify signature (stripe.webhooks.constructEvent)
  2. Verify appId === "go-cart-multi-vendors-e-commerce"
  3. Switch on event.type:
     ├── payment_intent.succeeded:
     │   → Mark all orders as isPaid: true
     │   → Clear user cart
     └── payment_intent.canceled:
         → Delete all unpaid orders from DB
```

### Session Configuration

- Payment method: `card` only
- Currency: `usd`
- Session expiry: 30 minutes from creation
- Metadata stored: `orderIds` (comma-separated), `userId`, `appId`

### COD Flow

```
POST /api/orders (paymentMethod: "COD")
  → Orders created with isPaid: false
  → Cart cleared immediately
  → No Stripe session needed
```

---

## Admin Dashboard Flow

```
GET /api/admin/is-admin
  → authAdmin(userId) checks ADMIN_EMAIL
  → Returns boolean

GET /api/admin/dashboard
  → Returns: { orders (count), stores (count), products (count),
               revenue (sum of all order totals), allOrders (for chart) }

GET /api/admin/approve-store
  → Returns stores with status "pending" or "rejected" (includes user data)

POST /api/admin/approve-store
  → Body: { storeId, status: "approved" | "rejected" }
  → If approved: sets status="approved", isActive=true

POST /api/admin/toggle-store
  → Body: { storeId }
  → Toggles store.isActive (enable/disable live store)

Admin Coupon CRUD:
  POST /api/admin/coupon    → Create coupon + schedule Inngest expiry job
  GET  /api/admin/coupon    → List all coupons (ordered by createdAt desc)
  DELETE /api/admin/coupon?code=X → Delete coupon by code
```

---

## Seller Dashboard Flow

```
GET /api/store/is-seller
  → authSeller(userId) checks approved store ownership
  → Returns { isSeller, storeInfo }

Store Application:
  POST /api/store/create (FormData)
    → Validates all fields (name, username, description, email, contact, address, logo)
    → Checks user doesn't already have a store
    → Checks username uniqueness
    → Uploads logo to ImageKit (optimized: WebP, 512px)
    → Creates Store record (status: "pending")
    → Returns "Applied, waiting for approval"

  GET /api/store/create
    → Returns current store status ("pending" / "approved" / "rejected" / "not registered")

Product Management:
  POST /api/store/product (FormData)
    → Uploads multiple images to ImageKit (optimized: WebP, 1024px)
    → Creates Product record linked to seller's storeId

  GET /api/store/product
    → Returns all products for seller's store

  POST /api/store/stock-toggle
    → Toggles product.inStock boolean

Seller Orders:
  GET /api/store/orders
    → Returns all orders for seller's store (includes user, address, orderItems with product)

  POST /api/store/orders
    → Body: { orderId, status }
    → Updates order status (ORDER_PLACED → PROCESSING → SHIPPED → DELIVERED)

Seller Dashboard:
  GET /api/store/dashboard
    → Returns { totalOrders, totalEarnings, totalProducts, ratings }
```

---

## Deployment Overview

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│    GitHub     │  push  │    Vercel    │  build  │  Production  │
│  Repository   │──────→│   CI/CD      │───────→│   Server     │
└──────────────┘        └──────┬───────┘        └──────────────┘
                               │
                    npm run build:
                    1. prisma generate
                    2. next build
                               │
                    postinstall hook:
                    prisma generate
```

**External service connections from production:**

| Service | Connection Method |
|---|---|
| Neon PostgreSQL | `DATABASE_URL` (pooled, WSS) |
| Clerk | `CLERK_SECRET_KEY` (server), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (client) |
| Stripe | `STRIPE_SECRET_KEY` (API calls), webhook at `/api/stripe` |
| ImageKit | Server-side SDK via `IMAGEKIT_PRIVATE_KEY` |
| Inngest | `INNGEST_EVENT_KEY` (send events), `INNGEST_SIGNING_KEY` (verify) |

---

## Recommendations

1. **Caching**: Add Redis or Next.js `unstable_cache` for product listings — currently every page load re-queries the DB
2. **Optimistic updates**: The wishlist thunk waits for server response before updating Redux state; consider optimistic toggle + rollback on error
3. **Multi-vendor order summary**: The checkout flow creates orders per-store but shows one combined total to the customer — consider showing per-store breakdowns in the UI
4. **Webhook security**: The Inngest webhook endpoint should validate incoming request signatures in production
5. **Session expiry handling**: The 30-minute Stripe session expiry is handled, but the user isn't notified if a session expires mid-checkout
