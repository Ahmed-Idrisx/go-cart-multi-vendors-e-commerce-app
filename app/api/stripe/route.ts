import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature")!;
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    const handlePaymentIntent = async (
      paymentIntentId: string,
      isPaid: boolean,
    ) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderIds, userId, appId } = session.data[0].metadata as {
        orderIds: string;
        userId: string;
        appId: string;
      };

      if (appId !== "go-cart-multi-vendors-e-commerce") {
        return NextResponse.json({ message: "Invalid appId", received: true });
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        // mark order as paid
        await Promise.all(
          orderIdsArray.map((orderId) =>
            prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            }),
          ),
        );
        // delete cart from user
        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        // delete order from db
        await Promise.all(
          orderIdsArray.map((orderId) =>
            prisma.order.delete({
              where: { id: orderId },
            }),
          ),
        );
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntent(event.data.object.id, true);
        break;
      case "payment_intent.canceled":
        await handlePaymentIntent(event.data.object.id, false);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    const err = error as { code?: string; message?: string };
    return NextResponse.json(
      { error: err.code || err.message || "Failed to process Stripe webhook" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
