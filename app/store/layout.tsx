import authSeller from "@/middlewares/authSeller";
import SellerNavbar from "@/components/store/StoreNavbar";
import SellerSidebar from "@/components/store/StoreSidebar";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "GoCart. - Store Dashboard",
  description: "GoCart. - Store Dashboard",
};

export default async function RootAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SignIn fallbackRedirectUrl="/store" routing="hash" />
      </div>
    );
  }
  const isSeller = await authSeller(userId);
  if (!isSeller) {
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
  const storeInfo = await prisma.store.findUnique({
    where: {
      userId: userId,
    },
  });

  return (
    <>
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
        <SellerNavbar />
        <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
          <SellerSidebar storeInfo={storeInfo} />
          <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
