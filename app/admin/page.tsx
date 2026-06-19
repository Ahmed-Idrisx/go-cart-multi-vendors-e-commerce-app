"use client";
import { dummyAdminDashboardData } from "@/assets/assets";
import Loading from "@/components/Loading";

import {
  CircleDollarSignIcon,
  LucideIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminDashboardData } from "@/types/types";
import OrdersAreaChart from "@/components/admin/OrderAreaChart";

interface DashboardCard {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    products: 0,
    revenue: "0",
    orders: 0,
    stores: 0,
    allOrders: [],
  });

  const dashboardCardsData: DashboardCard[] = [
    {
      title: "Total Products",
      value: String(dashboardData.products),
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Revenue",
      value: currency + dashboardData.revenue,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Total Orders",
      value: String(dashboardData.orders),
      icon: TagsIcon,
    },
    {
      title: "Total Stores",
      value: String(dashboardData.stores),
      icon: StoreIcon,
    },
  ];

  const fetchDashboardData = async () => {
    setDashboardData(dummyAdminDashboardData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

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
            className="flex items-center gap-10 border border-slate-200 dark:border-slate-700 p-3 px-6 rounded-lg bg-white dark:bg-slate-900"
          >
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700 dark:text-slate-200">
                {card.value}
              </b>
            </div>
            <card.icon
              size={50}
              className="w-11 h-11 p-2.5 text-slate-400 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <OrdersAreaChart allOrders={dashboardData.allOrders} />
    </div>
  );
}
