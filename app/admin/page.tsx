import {
  ArrowRightIcon,
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
} from "lucide-react";
import OrdersAreaChart from "@/components/admin/OrderAreaChart";
import { auth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const isAdmin = await authAdmin(userId);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-slate-950">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400 dark:text-slate-500">
          You are not authorized to access this page
        </h1>
        <Link
          href="/"
          className="bg-slate-700 dark:bg-slate-600 text-white flex items-center gap-2 mt-8 py-2 px-6 max-sm:text-sm rounded-full hover:bg-slate-800 dark:hover:bg-slate-500 transition"
        >
          Go to home <ArrowRightIcon size={18} />
        </Link>
      </div>
    );
  }
  const [orders, stores, allOrders, products] = await Promise.all([
    prisma.order.count(),
    prisma.store.count(),
    prisma.order.findMany({ select: { createdAt: true, total: true } }),
    prisma.product.count(),
  ]);

  let totalRevenue = 0;
  allOrders.forEach((order) => {
    totalRevenue += order.total;
  });
  const revenue = totalRevenue.toFixed(2);

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: String(products),
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Revenue",
      value: "$" + revenue,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Total Orders",
      value: String(orders),
      icon: TagsIcon,
    },
    {
      title: "Total Stores",
      value: String(stores),
      icon: StoreIcon,
    },
  ];

  return (
    <div className="text-slate-500 dark:text-slate-400">
      <h1 className="text-2xl">
        Admin{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Dashboard
        </span>
      </h1>

      {/* Cards */}
      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-11 border border-slate-200 dark:border-slate-700 p-3 px-6 rounded-lg bg-white dark:bg-slate-900"
          >
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <p className="text-2xl font-medium text-slate-700 dark:text-slate-200">
                {card.value}
              </p>
            </div>
            <card.icon
              size={50}
              className="w-11 h-11 p-2.5 text-slate-400 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <OrdersAreaChart allOrders={allOrders} />
    </div>
  );
}
