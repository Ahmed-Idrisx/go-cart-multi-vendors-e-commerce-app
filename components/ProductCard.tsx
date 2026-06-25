"use client";
import { ShoppingCart, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/types";
import WishlistButton from "./WishlistButton";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useAppDispatch } from "@/hooks/hooks";
import toast from "react-hot-toast";

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const rating =
    product.rating && product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length,
        )
      : 0;

  const handleAddToCart = async (productId: string) => {
    dispatch(addToCart({ productId }));
    toast.success("Added to cart");
  };

  return (
    <div className="group relative max-xl:mx-auto w-full sm:w-60 flex flex-col">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton productId={product.id} />
      </div>
      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="bg-gray-100 dark:bg-slate-800 h-40 sm:h-64 rounded-lg flex items-center justify-center relative overflow-hidden transition duration-300">
          {product.images && product.images[0] && (
            <Image
              width={500}
              height={500}
              className="max-h-30 sm:max-h-40 w-auto group-hover:scale-105 transition duration-300 object-contain"
              src={product.images[0] as string}
              alt={product.name}
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-3 text-sm text-slate-800 dark:text-slate-200 pt-2 max-w-60">
          <div>
            <p className="font-medium truncate max-w-35 sm:max-w-45">
              {product.name}
            </p>
            <div className="flex mt-1">
              {Array(5)
                .fill("")
                .map((_, index) => (
                  <StarIcon
                    key={index}
                    size={14}
                    className="text-transparent"
                    fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                  />
                ))}
            </div>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">
            ${product.price}
          </p>
        </div>
        <button
          onClick={() => handleAddToCart(product.id)}
          className="mt-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2 text-sm font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </Link>
    </div>
  );
}
