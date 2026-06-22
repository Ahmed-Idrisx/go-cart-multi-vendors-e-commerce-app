import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get dashboard data for admin (total orders, total revenue, total products, total stores)
export async function GET() {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    // get total orders
    const orders = await prisma.order.count();

    // get total stores on app
    const stores = await prisma.store.count();

    // get all orders includes only createdAt and total & calculate total revenue
    const allOrders = await prisma.order.findMany({
      select: { createdAt: true, total: true },
    });

    let totalRevenue = 0;
    allOrders.forEach((order) => {
      totalRevenue += order.total;
    });

    const revenue = totalRevenue.toFixed(2);

    // total products on app
    const products = await prisma.product.count();

    const dashboardData = {
      orders,
      stores,
      revenue,
      products,
      allOrders,
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    return NextResponse.json({ error: code || message }, { status: 400 });
  }
}
