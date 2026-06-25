# Database Schema

This document describes the GoCart database schema as defined in `prisma/schema.prisma`. The database is **PostgreSQL** hosted on **Neon** (serverless), accessed via Prisma 6 with the `@prisma/adapter-neon` driver adapter.

---

## Entity Relationship Diagram

```
┌──────────┐       ┌───────────┐       ┌───────────┐
│   User   │──1:1──│   Store   │──1:N──│  Product  │
│          │       │           │       │           │
│  id (PK) │       │  id (PK)  │       │  id (PK)  │
│  cart {}  │       │  userId   │       │  storeId  │
│  wishlist │       │  status   │       │  images[] │
└────┬─────┘       └─────┬─────┘       └─────┬─────┘
     │                   │                    │
     │ 1:N               │ 1:N               │ 1:N
     ▼                   ▼                    ▼
┌──────────┐       ┌───────────┐       ┌───────────┐
│ Address  │       │   Order   │──1:N──│ OrderItem │
│          │       │           │       │           │
│  id (PK) │       │  id (PK)  │       │ orderId   │
│  userId  │       │  userId   │       │ productId │
└──────────┘       │  storeId  │       │ (comp PK) │
                   │  addressId│       └───────────┘
     ┌─────────────┤           │
     │             └───────────┘
     │ 1:N
     ▼
┌──────────┐       ┌───────────┐
│  Rating  │       │  Coupon   │
│          │       │           │
│  id (PK) │       │ code (PK) │
│  userId  │       │ discount  │
│ productId│       │ expiresAt │
│  orderId │       └───────────┘
└──────────┘
```

---

## Models

### User

The core user record, synced from Clerk via Inngest webhook functions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Clerk user ID (set externally, not auto-generated) |
| `name` | `String` | — | Full name from Clerk (`firstName lastName`) |
| `email` | `String` | — | Primary email from Clerk |
| `image` | `String` | — | Profile image URL from Clerk |
| `cart` | `Json` | `@default("{}")` | Shopping cart: `{ [productId]: quantity }` |
| `wishlist` | `Json` | `@default("{}")` | Wishlist: `{ [productId]: true }` |

**Relations:**
- `ratings` → `Rating[]` (one-to-many)
- `Address` → `Address[]` (one-to-many)
- `store` → `Store?` (one-to-one, optional)
- `buyerOrders` → `Order[]` via `BuyerRelation` (one-to-many)

**Design Rationale:**
- `id` uses the Clerk user ID directly (no auto-generation) so there's a single source of truth for identity
- `cart` and `wishlist` are stored as JSON fields rather than separate tables — this avoids extra joins for frequently-accessed data and matches the client-side Redux state shape (`Record<string, number>` and `Record<string, boolean>`)

---

### Store

Represents a seller's store. Each user can have at most one store.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Auto-generated store ID |
| `userId` | `String` | `@unique` | FK → User. One store per user |
| `name` | `String` | — | Store display name |
| `description` | `String` | — | Store description |
| `username` | `String` | `@unique` | URL-friendly slug (lowercased) |
| `address` | `String` | — | Physical store address |
| `status` | `StoreStatus` | `@default(pending)` | `pending`, `approved`, `rejected` |
| `isActive` | `Boolean` | `@default(false)` | Whether the store is live (set by admin) |
| `logo` | `String` | — | ImageKit URL for the store logo |
| `email` | `String` | — | Store contact email |
| `contact` | `String` | — | Store phone number |
| `createdAt` | `DateTime` | `@default(now())` | — |
| `updatedAt` | `DateTime` | `@updatedAt` | — |

**Relations:**
- `user` → `User` (many-to-one via `userId`)
- `Product` → `Product[]` (one-to-many)
- `Order` → `Order[]` (one-to-many)

**Design Rationale:**
- `status` is an enum (`StoreStatus`) with three values, providing clear application flow states
- `isActive` is separate from `status` — an approved store can be temporarily deactivated by an admin without changing its approval status
- `username` is unique and lowercased, enabling clean store URLs (`/shop?store=username`)

---

### Product

Products belong to a store and are browsable by customers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | — |
| `name` | `String` | — | Product name |
| `description` | `String` | — | Product description |
| `mrp` | `Float` | — | Maximum Retail Price (original) |
| `price` | `Float` | — | Sale price (what customer pays) |
| `images` | `String[]` | — | Array of ImageKit URLs |
| `category` | `String` | — | Product category (free-text) |
| `inStock` | `Boolean` | `@default(true)` | Toggled by seller |
| `storeId` | `String` | — | FK → Store |
| `createdAt` | `DateTime` | `@default(now())` | — |
| `updatedAt` | `DateTime` | `@updatedAt` | — |

**Relations:**
- `store` → `Store` (many-to-one, `onDelete: Cascade`)
- `orderItems` → `OrderItem[]` (one-to-many)
- `rating` → `Rating[]` (one-to-many)

**Design Rationale:**
- `mrp` and `price` are separate fields to show discount percentage in the UI
- `images` is a `String[]` (PostgreSQL array) rather than a separate table — simpler for a fixed-size image set
- `category` is a free-text string (not a separate `Category` model) — simple for now but may need normalization later
- `onDelete: Cascade` from Store means deleting a store removes all its products

---

### Order

Represents a customer order to a specific store. Multi-vendor carts produce multiple orders (one per store).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | — |
| `total` | `Float` | — | Final total (after coupon + shipping) |
| `status` | `OrderStatus` | `@default(ORDER_PLACED)` | Enum: `ORDER_PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED` |
| `userId` | `String` | — | FK → User (buyer) |
| `storeId` | `String` | — | FK → Store (seller) |
| `addressId` | `String` | — | FK → Address |
| `isPaid` | `Boolean` | `@default(false)` | Set to `true` by Stripe webhook on success |
| `paymentMethod` | `PaymentMethod` | — | Enum: `COD`, `STRIPE` |
| `isCouponUsed` | `Boolean` | `@default(false)` | Whether a coupon was applied |
| `coupon` | `Json` | `@default("{}")` | Snapshot of the coupon at time of order |
| `createdAt` | `DateTime` | `@default(now())` | — |
| `updatedAt` | `DateTime` | `@updatedAt` | — |

**Relations:**
- `user` → `User` via `BuyerRelation` (many-to-one)
- `store` → `Store` (many-to-one)
- `address` → `Address` (many-to-one)
- `orderItems` → `OrderItem[]` (one-to-many)

**Design Rationale:**
- Orders reference `storeId` directly because a single checkout creates one order per vendor store
- `coupon` is stored as a JSON snapshot, not a FK reference — this preserves the coupon details even if the coupon is later deleted
- `isPaid` defaults to `false` and is only set to `true` by the Stripe webhook — COD orders remain `isPaid: false` even after delivery

---

### OrderItem

Line items within an order. Uses a composite primary key.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `orderId` | `String` | Composite PK | FK → Order |
| `productId` | `String` | Composite PK | FK → Product |
| `quantity` | `Int` | — | Number of units |
| `price` | `Float` | — | Price at time of order (snapshot) |

**Primary Key:** `@@id([orderId, productId])`

**Relations:**
- `order` → `Order` (many-to-one, `onDelete: Cascade`)
- `product` → `Product` (many-to-one)

**Design Rationale:**
- `price` is snapshotted at order time — if the product price changes later, existing orders remain correct
- Composite PK prevents duplicate product entries within the same order
- `onDelete: Cascade` from Order means deleting an order removes its items (used when Stripe payment is canceled)

---

### Rating

Product reviews tied to a specific order (to verify purchase).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | — |
| `rating` | `Int` | — | Star rating (1–5) |
| `review` | `String` | — | Review text |
| `userId` | `String` | — | FK → User |
| `productId` | `String` | — | FK → Product |
| `orderId` | `String` | — | FK reference (not a relation in schema) |
| `createdAt` | `DateTime` | `@default(now())` | — |
| `updatedAt` | `DateTime` | `@updatedAt` | — |

**Unique Constraint:** `@@unique([userId, productId, orderId])`

**Relations:**
- `user` → `User` (many-to-one, `onDelete: Cascade`)
- `product` → `Product` (many-to-one, `onDelete: Cascade`)

**Design Rationale:**
- The unique constraint on `[userId, productId, orderId]` prevents a user from rating the same product twice for the same order, but allows re-rating if they purchase it again in a different order
- `orderId` is stored as a plain string, not a Prisma relation — this simplifies the schema while still enabling the duplicate-review check

---

### Address

Shipping addresses for order placement.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | — |
| `userId` | `String` | — | FK → User |
| `name` | `String` | — | Recipient name |
| `email` | `String` | — | Contact email |
| `street` | `String` | — | Street address |
| `city` | `String` | — | City |
| `state` | `String` | — | State/province |
| `zip` | `String` | — | Postal code |
| `country` | `String` | — | Country |
| `phone` | `String` | — | Phone number |
| `createdAt` | `DateTime` | `@default(now())` | — |

**Relations:**
- `Order` → `Order[]` (one-to-many)
- `user` → `User` (many-to-one, `onDelete: Cascade`)

---

### Coupon

Discount codes managed by the admin.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `code` | `String` | `@id` | Unique coupon code (uppercased, used as PK) |
| `description` | `String` | — | Human-readable description |
| `discount` | `Float` | — | Percentage discount (e.g., `20` for 20%) |
| `forNewUser` | `Boolean` | — | Only valid for users with no prior orders |
| `forMember` | `Boolean` | `@default(false)` | Only valid for Clerk Plus plan members |
| `isPublic` | `Boolean` | — | Whether the coupon is publicly visible |
| `expiresAt` | `DateTime` | — | Expiry date (checked at validation time) |
| `createdAt` | `DateTime` | `@default(now())` | — |

**Design Rationale:**
- `code` is the primary key (no separate auto-generated ID) — coupon codes are naturally unique identifiers
- Expired coupons are auto-deleted by an Inngest background job (`deleteCouponOnExpiry`) that sleeps until the expiry date
- `forNewUser` and `forMember` are separate boolean flags — a coupon can be both (or neither)

---

## Enums

### OrderStatus

```prisma
enum OrderStatus {
  ORDER_PLACED
  PROCESSING
  SHIPPED
  DELIVERED
}
```

### PaymentMethod

```prisma
enum PaymentMethod {
  COD
  STRIPE
}
```

### StoreStatus

```prisma
enum StoreStatus {
  pending
  approved
  rejected
}
```

---

## Database Connection

The Prisma client is configured in `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });
```

- **Pooled connection** (`DATABASE_URL`): Used by the application at runtime
- **Direct connection** (`DIRECT_URL`): Used by Prisma CLI for migrations

---

## Recommendations

1. **Indexes**: Add indexes on frequently queried foreign keys (`Order.userId`, `Order.storeId`, `Product.storeId`, `Rating.productId`) for better query performance
2. **Category normalization**: Currently `Product.category` is free-text — consider a `Category` model for filtering consistency
3. **Soft deletes**: Products and stores are never soft-deleted — consider adding a `deletedAt` field instead of hard deletes
4. **Order → Rating relation**: `Rating.orderId` is a plain string, not a formal Prisma relation — consider adding `@relation` for referential integrity
5. **Address deletion protection**: Addresses referenced by orders should not be deletable — currently no cascade or protection rule exists
6. **Wishlist migration**: The `wishlist` JSON field could be migrated to a separate `Wishlist` table for query-ability and analytics
