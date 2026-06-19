"use client";
import { dummyStoreDashboardData } from "@/assets/assets";
import Loading from "@/components/Loading";
import { StoreDashboardData, Rating } from "@/types/types";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(1);
  const [dashboardData, setDashboardData] = useState<StoreDashboardData>({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
  });

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: dashboardData.totalProducts,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Earnings",
      value: "$" + dashboardData.totalEarnings,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders,
      icon: TagsIcon,
    },
    {
      title: "Total Ratings",
      value: dashboardData.ratings.length,
      icon: StarIcon,
    },
  ];

  const fetchDashboardData = async () => {
    setDashboardData(dummyStoreDashboardData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

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
        {dashboardData.ratings
          .slice(0, visibleReviewsCount)
          .map((review: Rating, index: number) => (
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
                <button
                  onClick={() =>
                    review.product &&
                    router.push(`/product/${review.product.id}`)
                  }
                  className="bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-5 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                >
                  View Product
                </button>
              </div>
            </div>
          ))}
      </div>
      {visibleReviewsCount < dashboardData.ratings.length && (
        <div className="flex justify-center mt-6 max-w-4xl">
          <button
            onClick={() => setVisibleReviewsCount((prev) => prev + 3)}
            className="bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-6 py-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all text-sm font-medium"
          >
            show more
          </button>
        </div>
      )}
    </div>
  );
}
