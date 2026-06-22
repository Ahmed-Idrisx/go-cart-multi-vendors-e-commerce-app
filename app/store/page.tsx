import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { Rating } from "@/types/types";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Dashboard() {
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

  // get all orders for the seller and // get total products for the seller with ratings
  const [orders, products] = await Promise.all([
    prisma.order.findMany({ where: { storeId } }),
    prisma.product.findMany({ where: { storeId } }),
  ]);
  // get total orders for the seller
  const totalOrders = orders.length;

  // calculate total earnings
  const totalEarnings = Math.round(
    orders.reduce((acc, order) => acc + order.total, 0),
  );

  // calculate total products for the seller
  const totalProducts = products.length;

  // get ratings for the products
  const ratings = await prisma.rating.findMany({
    where: { productId: { in: products.map((product) => product.id) } },
    include: { user: true, product: true },
  });

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Earnings",
      value: "$" + totalEarnings,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: TagsIcon,
    },
    {
      title: "Total Ratings",
      value: ratings.length,
      icon: StarIcon,
    },
  ];

  return (
    <div className="text-slate-500 dark:text-slate-400 mb-20">
      <h1 className="text-2xl">
        Seller{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Dashboard
        </span>
      </h1>

      <div className="flex flex-wrap gap-5 mb-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-11 border border-slate-200 dark:border-slate-700 py-3 px-6 rounded-lg bg-white dark:bg-slate-900"
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

      <h2 className="text-slate-700 dark:text-slate-300">Total Reviews</h2>

      <div className="mt-5">
        {ratings.map((review: Rating, index: number) => (
          <div
            key={index}
            className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 max-w-4xl"
          >
            <div>
              <div className="flex gap-3">
                {review.user && "image" in review.user && (
                  <Image
                    src={review.user.image}
                    alt="user image"
                    className="w-10 aspect-square rounded-full"
                    width={100}
                    height={100}
                  />
                )}
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {review.user?.name}
                  </p>
                  <p className="font-light text-slate-500 dark:text-slate-400">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xs leading-6">
                {review.review}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-6 sm:items-end">
              <div className="flex flex-col sm:items-end">
                <p className="text-slate-400 dark:text-slate-500">
                  {review.product && "category" in review.product
                    ? review.product.category
                    : ""}
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {review.product?.name}
                </p>
                <div className="flex items-center">
                  {Array(5)
                    .fill("")
                    .map((_, i) => (
                      <StarIcon
                        key={i}
                        size={17}
                        className="text-transparent mt-1"
                        fill={review.rating >= i + 1 ? "#00C950" : "#D1D5DB"}
                      />
                    ))}
                </div>
              </div>
              {review.product && (
                <Link
                  href={`/product/${review.product.id}`}
                  className="bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-5 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                >
                  View Product
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
