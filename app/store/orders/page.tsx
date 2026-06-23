import { ArrowRightIcon } from "lucide-react";
import StoreOrders from "@/components/store/StoreOrders";
import { auth } from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Order } from "@/types/types";

export default async function StoreOrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SignIn fallbackRedirectUrl="/store" routing="hash" />
      </div>
    );
  }
  const storeId = await authSeller(userId);
  if (!storeId) {
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

  const orders = (await prisma.order.findMany({
    where: { storeId: storeId },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      address: true,
      orderItems: { include: { product: true } },
    },
  })) as unknown as Order[];

  return <StoreOrders storeOrders={orders} />;
}
