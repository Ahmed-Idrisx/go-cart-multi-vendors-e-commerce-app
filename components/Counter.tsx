"use client";

import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

export default function Counter({ productId }: { productId: string }) {
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const dispatch = useAppDispatch();

  const addToCartHandler = () => {
    dispatch(addToCart({ productId }));
  };

  const removeFromCartHandler = () => {
    dispatch(removeFromCart({ productId }));
  };

  return (
    <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 max-sm:text-sm text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-800 transition-colors">
      <button
        onClick={removeFromCartHandler}
        className="p-1 select-none hover:text-red-500 transition-colors"
      >
        -
      </button>
      <p className="p-1 font-medium text-slate-900 dark:text-white">
        {cartItems[productId] ?? 0}
      </p>
      <button
        onClick={addToCartHandler}
        className="p-1 select-none hover:text-green-500 transition-colors"
      >
        +
      </button>
    </div>
  );
}
