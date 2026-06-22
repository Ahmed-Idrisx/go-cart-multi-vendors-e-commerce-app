import { format } from "date-fns";
import toast from "react-hot-toast";
import { ArrowRightIcon, Trash2Icon } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AddCouponForm from "@/components/admin/AddCoupon";
import DeleteCoupon from "@/components/admin/DeleteCoupon";

export default async function AdminCoupons() {
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
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="text-slate-500 dark:text-slate-400 mb-40">
      {/* Add Coupon */}
      <AddCouponForm />

      {/* List Coupons */}
      <div className="mt-14">
        <h2 className="text-2xl">
          List{" "}
          <span className="text-slate-800 dark:text-slate-100 font-medium">
            Coupons
          </span>
        </h2>
        <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 dark:border-slate-700 max-w-4xl">
          <table className="min-w-full bg-white dark:bg-slate-900 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Code
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Description
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Discount
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Expires At
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  New User
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  For Member
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {coupons.map((coupon) => (
                <tr
                  key={coupon.code}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-100 font-medium">
                    {coupon.code}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.description}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.discount}%
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {format(new Date(coupon.expiresAt), "yyyy-MM-dd")}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.forNewUser ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.forMember ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    <DeleteCoupon code={coupon.code} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
