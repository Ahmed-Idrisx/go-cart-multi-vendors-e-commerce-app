import { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import OrderItem from "@/components/OrderItem";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import { Coupon, Order } from "@/types/types";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track your orders.",
};

export default async function Orders() {
  const { userId } = await auth();

  if (!userId) {
    if (!userId) {
      redirect("/sign-in");
    }
  }

  const rawOrders = await prisma.order.findMany({
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

  const orders = rawOrders.map((order) => ({
    ...order,
    coupon: (order.coupon as Coupon | null) ?? undefined,
  })) as Order[];

  if (orders.length <= 0) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          You have no orders
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] mx-6">
      <div className="my-20 max-w-7xl mx-auto">
        <PageTitle
          heading="My Orders"
          text={`Showing ${orders.length} order${orders.length === 1 ? "" : "s"}`}
          linkText="Go to home"
        />

        <table className="w-full max-w-5xl text-slate-500 dark:text-slate-400 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
          <thead>
            <tr className="max-sm:text-sm text-slate-600 dark:text-slate-300 max-md:hidden">
              <th className="text-left">Product</th>
              <th className="text-center">Total Price</th>
              <th className="text-left">Address</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderItem order={order} key={order.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
