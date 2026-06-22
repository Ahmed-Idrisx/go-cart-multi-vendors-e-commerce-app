import ApproveAndRejectStores from "@/components/admin/ApproveAndRejectStores";
import StoreInfo from "@/components/admin/StoreInfo";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default async function AdminApprove() {
  const { userId } = await auth();
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

  const stores = await prisma.store.findMany({
    where: { status: { in: ["pending", "rejected"] } },
    include: { user: true },
  });
  return (
    <div className="text-slate-500 dark:text-slate-400 mb-28">
      <h1 className="text-2xl">
        Approve{" "}
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
              <div className="flex gap-3 pt-2 flex-wrap">
                <ApproveAndRejectStores storeId={store.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <h1 className="text-3xl text-slate-400 dark:text-slate-500 font-medium">
            No Application Pending
          </h1>
        </div>
      )}
    </div>
  );
}
