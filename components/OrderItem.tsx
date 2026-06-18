"use client";

import { useState } from "react";
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { Order } from "@/types/types";
import RatingModal from "./RatingModal";
import Rating from "./Rating";
import { useAppSelector } from "@/hooks/hooks";

const STATUS_STYLES: Record<string, { light: string; dark: string }> = {
  ORDER_PLACED: {
    light: "text-gray-600 bg-gray-100",
    dark: "dark:text-gray-100 dark:bg-gray-600",
  },
  PROCESSING: {
    light: "text-yellow-600 bg-yellow-100",
    dark: "dark:text-yellow-400 dark:bg-yellow-950/30",
  },
  SHIPPED: {
    light: "text-blue-600 bg-blue-100",
    dark: "dark:text-blue-400 dark:bg-blue-950/30",
  },
  DELIVERED: {
    light: "text-green-600 bg-green-100",
    dark: "dark:text-green-400 dark:bg-green-950/30",
  },
  DEFAULT: {
    light: "text-gray-600 bg-gray-100",
    dark: "dark:text-gray-400 dark:bg-gray-950/30",
  },
};
function getStatusClass(status: string): string {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DEFAULT;
  return `${s.light} ${s.dark}`;
}

export default function OrderItem({ order }: { order: Order }) {
  const [ratingModal, setRatingModal] = useState<{
    orderId: string;
    productId: string;
  } | null>(null);

  const { ratings } = useAppSelector((state) => state.rating);

  return (
    <>
      <tr className="text-sm border-none">
        <td className="text-left py-4">
          <div className="flex flex-col gap-6">
            {order.orderItems.map((item) => {
              const existingRating = ratings.find(
                (r) =>
                  order.id === r.orderId && item.product.id === r.productId,
              );
              return (
                <div
                  key={`${order.id}-${item.productId}`}
                  className="flex items-center gap-4"
                >
                  <div className="w-20 aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-md border border-transparent dark:border-slate-700">
                    <Image
                      className="h-14 w-auto object-contain"
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={50}
                      height={50}
                    />
                  </div>
                  <div className="flex flex-col justify-center text-sm">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-base">
                      {item.product.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      ${item.price} &bull; Qty: {item.quantity}
                    </p>
                    <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toDateString()}
                    </p>
                    <div>
                      {existingRating ? (
                        <Rating value={existingRating.rating} />
                      ) : (
                        <button
                          onClick={() =>
                            setRatingModal({
                              orderId: order.id,
                              productId: item.product.id,
                            })
                          }
                          className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && "hidden"}`}
                        >
                          Rate Product
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </td>

        <td className="text-center max-md:hidden font-semibold text-slate-900 dark:text-white py-4">
          ${order.total}
        </td>

        <td className="text-left max-md:hidden text-slate-600 dark:text-slate-300 py-4">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {order.user?.name}
          </p>
          <p className="text-xs">{order.address.street},</p>
          <p className="text-xs">
            {order.address.city}, {order.address.state}, {order.address.zip},{" "}
            {order.address.country}
          </p>
          <p className="text-xs">{order.address.phone}</p>
        </td>

        <td className="text-left max-md:hidden py-4">
          <div
            className={`flex items-center justify-center gap-1 rounded-full py-3 px-1 ${getStatusClass(order.status)}`}
          >
            <DotIcon size={10} className="scale-[2.5]" />
            {order.status.replace(/_/g, " ").toLowerCase()}
          </div>
        </td>
      </tr>

      {/* Mobile address + status row */}
      <tr className="md:hidden">
        <td
          colSpan={5}
          className="py-2 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl"
        >
          <p className=" text-slate-800 dark:text-slate-200">
            {order.address.name}
          </p>
          <p>
            {order.address.street}, {order.address.city}, {order.address.state},{" "}
            {order.address.zip}, {order.address.country}
          </p>
          <p>{order.address.phone}</p>
          <div className="flex items-center mt-3">
            <span
              className={`text-center mx-auto px-6 py-1.5 rounded ${getStatusClass(order.status)}`}
            >
              {order.status.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan={4} className="py-4">
          <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
        </td>
      </tr>

      {ratingModal && (
        <RatingModal
          ratingModal={ratingModal}
          setRatingModal={setRatingModal}
        />
      )}
    </>
  );
}
