"use client";
// import { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import { orderDummyData } from "@/assets/assets";
import OrderItem from "@/components/OrderItem";
import { useEffect, useState } from "react";
import { Order } from "@/types/types";

// export const metadata: Metadata = {
//   title: "My Orders",
//   description: "View and track your orders.",
// };

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    setOrders(orderDummyData);
  }, []);

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
