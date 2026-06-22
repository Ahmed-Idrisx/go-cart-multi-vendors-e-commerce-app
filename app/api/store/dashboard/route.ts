import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get dashboard data for seller (total earnings, total products, total orders)
export async function GET() {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId as string);

    // get all orders for the seller
    const orders = await prisma.order.findMany({
      where: {
        storeId: storeId as string,
      },
    });
    // get total orders for the seller
    const totalOrders = orders.length;

    // calculate total earnings
    const totalEarnings = Math.round(
      orders.reduce((acc, order) => acc + order.total, 0),
    );
    // get total products for the seller with ratings
    const products = await prisma.product.findMany({
      where: {
        storeId: storeId as string,
      },
    });
    // calculate total products for the seller
    const totalProducts = products.length;
    // get ratings for the products
    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map((product) => product.id) } },
      include: { user: true, product: true },
    });

    const dashboardData = {
      ratings,
      totalOrders,
      totalEarnings,
      totalProducts,
    };

    return NextResponse.json({ dashboardData });
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
