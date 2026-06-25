import { Prisma } from "@prisma/client";
import { StaticImageData } from "next/image";

/* ============================================================ */
/*  Shared / utility types                                       */
/* ============================================================ */

/**
 * Images come from local static imports while you're on dummy data
 * (StaticImageData from next/image), and will become plain URL
 * strings once products/stores are served from the database.
 * Keeping this union means you won't need to touch these types
 * when you wire up Prisma later.
 */
export type ImageSource = string | StaticImageData;

/**
 * Prisma returns `Date` objects, but your dummy data uses ISO date
 * strings. This union keeps both valid.
 */
export type DateInput = string | Date;

/**
 * Order.status in the Prisma schema is a real enum. We mirror it
 * here as a string-literal union (not a TS `enum`) so plain string
 * values like "ORDER_PLACED" in the dummy data type-check correctly
 * without needing an import from "@prisma/client".
 */
export type OrderStatus =
  | "ORDER_PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED";

export type PaymentMethod = "COD" | "STRIPE";

/**
 * Note: in schema.prisma, Store.status is currently a plain `String`
 * (not an enum). This union reflects how it's actually used in the
 * UI/admin flow. Nothing stops the DB from technically holding any
 * string — validate this at the application layer.
 */
export type StoreStatus = "pending" | "approved" | "rejected";

/** Shape of the JSON `cart` field: { [productId]: quantity } */
export type Cart = Record<string, number>;
export type Wishlist = Record<string, boolean>;

/* ============================================================ */
/*  User                                                         */
/* ============================================================ */

export interface User {
  id: string;
  name: string;
  email: string;
  image: ImageSource;
  cart?: Prisma.JsonValue;
}

/** Trimmed-down User, used wherever only name/image are embedded (e.g. inside a Rating) */
export type UserSummary = Pick<User, "name" | "image">;

/* ============================================================ */
/*  Store                                                         */
/* ============================================================ */

export interface Store {
  id: string;
  userId: string;
  name: string;
  description: string;
  username: string;
  address: string;
  status: StoreStatus;
  isActive: boolean;
  logo: ImageSource;
  email: string;
  contact: string;
  createdAt: DateInput;
  updatedAt: DateInput;

  // Relations
  user?: User;
}

/* ============================================================ */
/*  Product                                                       */
/* ============================================================ */

export interface Product {
  id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  images: ImageSource[];
  category: string;
  inStock: boolean;
  storeId: string;
  createdAt: DateInput;
  updatedAt: DateInput;

  // Relations
  store?: Store;
  rating: Rating[];
}

/** Trimmed-down Product, used wherever only id/name/category are embedded (e.g. inside a Rating) */
export type ProductSummary = Pick<Product, "id" | "name" | "category">;

/* ============================================================ */
/*  Rating                                                         */
/* ============================================================ */

export interface Rating {
  id: string;
  rating: number;
  review: string;
  userId: string;
  productId: string;
  orderId?: string;
  createdAt: DateInput;
  updatedAt: DateInput;

  // Relations — can be the full record or just the summary fields
  // depending on what the query selected.
  user?: User | UserSummary;
  product?: Product | ProductSummary;
}

/* ============================================================ */
/*  Address                                                       */
/* ============================================================ */

export interface Address {
  id: string;
  userId: string;
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  createdAt: DateInput;
}

/* ============================================================ */
/*  Coupon                                                         */
/* ============================================================ */

export interface Coupon {
  code: string;
  description: string;
  discount: number;
  forNewUser: boolean;
  forMember: boolean;
  isPublic: boolean;
  expiresAt: DateInput;
  createdAt: DateInput;
}

/* ============================================================ */
/*  Order & OrderItem                                             */
/* ============================================================ */

export interface OrderItem {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;

  // Relation
  product: Product;
}

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  userId: string;
  storeId: string;
  addressId: string;
  isPaid: boolean;
  paymentMethod: PaymentMethod;
  createdAt: DateInput;
  updatedAt: DateInput;
  isCouponUsed: boolean;
  /**
   * Stored as JSON in Prisma. Using `Partial<Coupon>` keeps it
   * flexible for an empty object `{}` while still giving you
   * autocomplete for the real coupon fields.
   */
  coupon?: Coupon;
  orderItems: OrderItem[];

  // Relations
  address: Address;
  user?: User;
  store?: Store;
}

/* ============================================================ */
/*  Dashboard aggregate types                                     */
/* ============================================================ */

export interface RevenueRecord {
  createdAt: DateInput;
  total: number;
}

export interface AdminDashboardData {
  orders: number;
  stores: number;
  products: number;
  revenue: string;
  allOrders: RevenueRecord[];
}

export interface StoreDashboardData {
  ratings: Rating[];
  totalOrders: number;
  totalEarnings: number;
  totalProducts: number;
}
