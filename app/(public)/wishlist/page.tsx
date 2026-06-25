"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { addToCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { toggleWishlistItem } from "@/lib/features/wishlist/wishlistSlice";
import { Product } from "@/types/types";
import PageTitle from "@/components/PageTitle";
import Image from "next/image";
import { ShoppingCart, Trash2Icon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.wishlistItems);
  const products = useAppSelector((state) => state.product.list);

  const wishlistArray: Product[] = [];
  for (const productId of Object.keys(wishlistItems)) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      wishlistArray.push(product);
    }
  }

  const handleAddToCart = async (productId: string) => {
    dispatch(addToCart({ productId }));

    // Remove from wishlist after adding to cart
    await dispatch(toggleWishlistItem({ productId })).unwrap();
    toast.success("Moved to cart");
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await dispatch(toggleWishlistItem({ productId })).unwrap();
    toast.success("Removed from wishlist");
  };

  if (wishlistArray.length === 0) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          Your wishlist is empty
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-6 text-slate-800 dark:text-slate-200">
      <div className="max-w-7xl mx-auto">
        <PageTitle
          heading="My Wishlist"
          text="Products you love"
          linkText="Continue Shopping"
        />

        <table className="w-full max-w-4xl text-slate-600 dark:text-slate-400 table-auto mb-10">
          <thead>
            <tr className="max-sm:text-sm">
              <th className="text-left pl-3">Product</th>
              <th>Price</th>
              <th>Add to Cart</th>
              <th className="max-md:hidden">Remove</th>
            </tr>
          </thead>
          <tbody>
            {wishlistArray.map((product) => (
              <tr
                key={product.id}
                className="space-x-2 bg-slate-50/30 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
              >
                <td className="flex gap-3 my-4 pl-3">
                  <div className="flex gap-3 items-center justify-center bg-slate-100 dark:bg-slate-800 size-18 rounded-md">
                    <Image
                      src={product.images[0] as string}
                      className="h-14 w-auto object-contain"
                      alt={product.name}
                      width={45}
                      height={45}
                    />
                  </div>
                  <div>
                    <p className="max-sm:text-sm text-slate-800 dark:text-slate-100">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.category}
                    </p>
                  </div>
                </td>
                <td className="text-center text-slate-800 dark:text-slate-100 font-medium">
                  ${product.price}
                </td>
                <td className="text-center">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2 text-sm font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </td>
                <td className="text-center max-md:hidden">
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="text-red-500 hover:text-red-700 p-2.5 rounded-full active:scale-95 transition-all"
                  >
                    <Trash2Icon size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
