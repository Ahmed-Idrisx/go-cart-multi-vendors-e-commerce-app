import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import type { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface UpdateOrderStatusBody {
  orderId: string;
  status: OrderStatus;
}

// update seller order status
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId as string);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }
    const { orderId, status } = (await request.json()) as UpdateOrderStatusBody;

    await prisma.order.update({
      where: { id: orderId, storeId: storeId },
      data: { status: status },
    });
    return NextResponse.json({ message: "order status updated!" });
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

// Get All Orders for a seller
export async function GET() {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId as string);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId: storeId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        address: true,
        orderItems: { include: { product: true } },
      },
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
