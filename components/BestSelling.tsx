"use client";

import Title from "./Title";
import ProductCard from "./ProductCard";
import { useAppSelector } from "@/hooks/hooks";

export default function BestSelling() {
  const displayQuantity = 8;

  const products = useAppSelector((state) => state.product.list);

  const bestSellingProducts = products
    .slice()
    .sort((a, b) => (b.rating?.length ?? 0) - (a.rating?.length ?? 0))
    .slice(0, displayQuantity);

  return (
    <div className="px-6 my-30 max-w-6xl mx-auto">
      <Title
        title="Best Selling"
        description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`}
        href="/shop"
      />
      <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
        {bestSellingProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
