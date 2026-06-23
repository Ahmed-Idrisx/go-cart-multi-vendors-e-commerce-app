// Add Order
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PaymentMethod, type Coupon } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface AddOrderBody {
  addressId: string;
  items: OrderItemInput[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

// add order
export async function POST(request: NextRequest) {
  try {
    const { userId, has } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }
    const { addressId, items, couponCode, paymentMethod } =
      (await request.json()) as AddOrderBody;

    // check if all required fields are present
    if (
      !addressId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Missing Order Details" },
        { status: 400 },
      );
    }
    let coupon: Coupon | null = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid coupon code" },
          { status: 404 },
        );
      }
      // check expiry
      if (coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
      }
    }
    // check if coupon is applicable for new users
    if (couponCode && coupon!.forNewUser) {
      const userOrders = await prisma.order.findMany({ where: { userId } });
      if (userOrders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users" },
          { status: 400 },
        );
      }
    }
    const isPlusMember = has({ plan: "plus" });
    // check if coupon is applicable for members
    if (couponCode && coupon!.forMember) {
      if (!isPlusMember) {
        return NextResponse.json(
          { error: "Coupon valid for Members only" },
          { status: 400 },
        );
      }
    }

    // Group orders by storeId using a Map
    const ordersByStore = new Map<
      string,
      (OrderItemInput & { price: number })[]
    >();
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) continue;
      const storeId = product.storeId;
      if (!ordersByStore.has(storeId)) {
        ordersByStore.set(storeId, []);
      }
      ordersByStore.get(storeId)!.push({ ...item, price: product.price });
    }
    const orderIds: string[] = [];
    let fullAmount = 0;
    let isShippingFreeAdded = false;
    // create orders for each seller
    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);

      if (couponCode) {
        total -= (total * coupon!.discount) / 100;
      }
      if (!isPlusMember && !isShippingFreeAdded) {
        total += 5;
        isShippingFreeAdded = true;
      }

      fullAmount += parseFloat(total.toFixed(2));

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: coupon ? true : false,
          coupon: coupon ? (coupon as object) : {},
          orderItems: {
            create: sellerItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      orderIds.push(order.id);
    }
    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
      const origin = request.headers.get("origin");
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Order",
              },
              unit_amount: Math.round(fullAmount * 100),
            },
            quantity: 1,
          },
        ],
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
        mode: "payment",
        success_url: `${origin}/orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: "go-cart-multi-vendors-e-commerce",
        },
      });
      return NextResponse.json({ session });
    }
    // clear the cart
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });
    return NextResponse.json({ message: "Order Placed Successfully" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    return NextResponse.json({ error: code || message }, { status: 400 });
  }
}

// get all orders for a user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          { AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }] },
        ],
      },
      include: {
        orderItems: { include: { product: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    return NextResponse.json({ error: code || message }, { status: 400 });
  }
}
