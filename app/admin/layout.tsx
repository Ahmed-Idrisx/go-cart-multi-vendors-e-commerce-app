import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { auth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "GoCart. - Admin",
  description: "GoCart. - Admin",
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
        <SignIn fallbackRedirectUrl="/admin" routing="hash" />
      </div>
    );
  }
  const isAdmin = await authAdmin(userId as string);

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
  return (
    <>
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
        <AdminNavbar />
        <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
          <AdminSidebar />
          <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
