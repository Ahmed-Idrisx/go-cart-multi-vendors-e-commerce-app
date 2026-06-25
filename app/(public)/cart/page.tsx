"use client";

import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Product } from "@/types/types";
import PageTitle from "@/components/PageTitle";
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";

type CartItem = Product & { quantity: number };

export default function Cart() {
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const products = useAppSelector((state) => state.product.list);

  const dispatch = useAppDispatch();

  const cartArray: CartItem[] = [];
  let totalPrice = 0;

  for (const [id, quantity] of Object.entries(cartItems)) {
    const product = products.find((p) => p.id === id);
    if (product) {
      cartArray.push({ ...product, quantity });
      totalPrice += product.price * quantity;
    }
  }

  const handleDeleteItemFromCart = (productId: string) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  if (cartArray.length === 0) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          Your cart is empty
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-6 text-slate-800 dark:text-slate-200">
      <div className="max-w-7xl mx-auto">
        <PageTitle
          heading="My Cart"
          text="Items in your cart"
          linkText="Continue Shopping"
        />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col mb-5">
          <table className="w-full max-w-4xl text-slate-600 dark:text-slate-400 table-auto">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left pl-3">Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th className="max-md:hidden">Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartArray.map((item) => (
                <tr
                  key={item.id}
                  className="space-x-2 bg-slate-50/30 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
                >
                  <td className="flex gap-3 my-4 pl-3">
                    <div className="flex gap-3 items-center justify-center bg-slate-100 dark:bg-slate-800 size-18 rounded-md">
                      <Image
                        src={item.images[0] as string}
                        className="h-14 w-auto object-contain"
                        alt={item.name}
                        width={45}
                        height={45}
                      />
                    </div>
                    <div>
                      <p className="max-sm:text-sm text-slate-800 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.category}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        ${item.price}
                      </p>
                    </div>
                  </td>
                  <td className="text-center">
                    <Counter productId={item.id} />
                  </td>
                  <td className="text-center text-slate-800 dark:text-slate-100 font-medium">
                    ${(item.price * item.quantity).toLocaleString()}
                  </td>
                  <td className="text-center max-md:hidden">
                    <button
                      onClick={() => handleDeleteItemFromCart(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="text-red-500 hover:text-red-700 p-2.5 rounded-full active:scale-95 transition-all"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <OrderSummary totalPrice={totalPrice} items={cartArray} />
        </div>
      </div>
    </div>
  );
}
