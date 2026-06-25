"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { toggleWishlistItem } from "@/lib/features/wishlist/wishlistSlice";
import { HeartIcon } from "lucide-react";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector(
    (state) => !!state.wishlist.wishlistItems[productId],
  );

  const handleToggle = async () => {
    const loadingToastId = toast.loading(
      inWishlist ? "Removing..." : "Adding...",
    );

    try {
      const result = await dispatch(toggleWishlistItem({ productId })).unwrap();

      toast.success(
        result.inWishlist ? "Added to wishlist" : "Removed from wishlist",
        { id: loadingToastId },
      );
    } catch (error) {
      const message =
        typeof error === "string" ? error : "Something went wrong";
      toast.error(message, { id: loadingToastId });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon
        size={30}
        className={
          inWishlist
            ? "text-red-500 fill-red-500"
            : "text-slate-400 hover:text-red-400 transition-colors"
        }
      />
    </button>
  );
}
