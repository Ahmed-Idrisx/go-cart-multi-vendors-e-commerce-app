import StoreInfo from "@/components/admin/StoreInfo";

import ToggleIsActive from "@/components/admin/ToggleIsActive";
import { auth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default async function AdminStores() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SignIn fallbackRedirectUrl="/store" routing="hash" />
      </div>
    );
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

  const stores = await prisma.store.findMany({
    where: { status: "approved" },
    include: { user: true },
  });
  return (
    <div className="text-slate-500 dark:text-slate-400 mb-28">
      <h1 className="text-2xl">
        Live{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Stores
        </span>
      </h1>

      {stores.length ? (
        <div className="flex flex-col gap-4 mt-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl"
            >
              {/* Store Info */}
              <StoreInfo store={store} />

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <p>Active</p>
                <label className="relative inline-flex items-center cursor-pointer ">
                  <ToggleIsActive
                    storeId={store.id}
                    isActive={store.isActive}
                  />
                  <div className="w-9 h-5 bg-slate-300  rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <h1 className="text-3xl text-slate-400 dark:text-slate-500 font-medium">
            No stores Available
          </h1>
        </div>
      )}
    </div>
  );
}
