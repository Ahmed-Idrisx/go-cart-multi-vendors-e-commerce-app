"use client";

import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  StarIcon,
  TagIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Product } from "@/types/types";

const ProductDetails = ({ product }: { product: Product }) => {
  const productId = product.id;

  const cart = useAppSelector((state) => state.cart.cartItems);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [mainImage, setMainImage] = useState(product.images[0]);

  const addToCartHandler = () => {
    dispatch(addToCart({ productId }));
  };

  const averageRating =
    product.rating.reduce((acc, item) => acc + item.rating, 0) /
    product.rating.length;

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(product.images[index])}
              className="bg-slate-100 dark:bg-slate-800 flex items-center justify-center w-26 h-26 rounded-lg group cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <Image
                src={image}
                className="group-hover:scale-105 group-active:scale-95 transition"
                alt="product image"
                width={45}
                height={45}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center h-100 sm:w-113 sm:h-113 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Image src={mainImage} alt="product image" width={250} height={250} />
        </div>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
          {product.name}
        </h1>

        <div className="flex items-center mt-2">
          {Array(5)
            .fill("")
            .map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className="text-transparent mt-0.5"
                fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
              />
            ))}
          <p className="text-sm ml-3 text-slate-500 dark:text-slate-400">
            {product.rating.length} Reviews
          </p>
        </div>

        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          <p>${product.price}</p>
          <p className="text-xl text-slate-400 dark:text-slate-500 line-through">
            ${product.mrp}
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <TagIcon size={14} />
          <p>
            Save{" "}
            {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
            right now
          </p>
        </div>

        <div className="flex items-end gap-5 mt-10">
          {cart[productId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg text-slate-800 dark:text-slate-100 font-semibold">
                Quantity
              </p>
              <Counter productId={productId} />
            </div>
          )}
          <button
            onClick={() =>
              !cart[productId] ? addToCartHandler() : router.push("/cart")
            }
            className="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 dark:hover:bg-slate-200 active:scale-95 transition"
          >
            {!cart[productId] ? "Add to Cart" : "View Cart"}
          </button>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-5" />

        <div className="flex flex-col gap-4 text-slate-500 dark:text-slate-400">
          <p className="flex gap-3 items-center">
            <EarthIcon
              className="text-slate-400 dark:text-slate-500"
              size={18}
            />
            Free shipping worldwide
          </p>
          <p className="flex gap-3 items-center">
            <CreditCardIcon
              className="text-slate-400 dark:text-slate-500"
              size={18}
            />
            100% Secured Payment
          </p>
          <p className="flex gap-3 items-center">
            <UserIcon
              className="text-slate-400 dark:text-slate-500"
              size={18}
            />
            Trusted by top brands
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
