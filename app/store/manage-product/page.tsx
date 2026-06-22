import Image from "next/image";
import Link from "next/link";
import ToggleAvailableProduct from "@/components/store/ToggleAvailableProduct";
import { auth } from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";
import { SignIn } from "@clerk/nextjs";
import { ArrowRightIcon } from "lucide-react";

export default async function StoreManageProducts() {
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
  const products = await prisma.product.findMany({
    where: {
      storeId,
    },
  });

  return (
    <>
      <h1 className="text-2xl text-slate-500 dark:text-slate-400 mb-5">
        Manage{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Products
        </span>
      </h1>
      <table className="w-full max-w-4xl text-left ring ring-slate-200 dark:ring-slate-700 rounded overflow-hidden text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Description</th>
            <th className="px-4 py-3 hidden md:table-cell">MRP</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <td className="px-4 py-3">
                <Link href={`/product/${product.id}`}>
                  <div className="flex gap-2 items-center">
                    <Image
                      width={40}
                      height={40}
                      className="p-1 shadow rounded cursor-pointer bg-white dark:bg-slate-800"
                      src={product.images[0]}
                      alt="product image"
                    />
                    {product.name}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 max-w-md text-slate-600 dark:text-slate-400 hidden md:table-cell truncate">
                {product.description}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                $ {product.mrp.toLocaleString()}
              </td>
              <td className="px-4 py-3">$ {product.price.toLocaleString()}</td>
              <td className="px-4 py-3 text-center">
                <label className="relative inline-flex items-center cursor-pointer ">
                  <ToggleAvailableProduct
                    productId={product.id}
                    inStock={product.inStock}
                  />
                  <div className="w-9 h-5 bg-slate-300  rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
