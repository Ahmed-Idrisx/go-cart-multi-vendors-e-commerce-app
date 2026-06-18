"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/hooks/hooks";
import ProductDetails from "@/components/ProductDetails";
import ProductDescription from "@/components/ProductDescription";

const Product = () => {
  const params = useParams();
  const productId = params?.productId as string;
  const products = useAppSelector((state) => state.product.list);
  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          Product Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="mx-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="  text-gray-600 text-sm mt-8 mb-5">
          Home / Products / {product?.category}
        </div>

        {/* Product Details */}
        {product && <ProductDetails product={product} />}

        {/* Description & Reviews */}
        {product && <ProductDescription product={product} />}
      </div>
    </div>
  );
};

export default Product;
