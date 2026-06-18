"use client";

import Title from "./Title";
import ProductCard from "./ProductCard";
import { useAppSelector } from "@/hooks/hooks";

export default function LatestProducts() {
  const displayQuantity = 4;
  const products = useAppSelector((state) => state.product.list);

  const latestProducts = products
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, displayQuantity);

  return (
    <div className="px-6 my-30 max-w-6xl mx-auto">
      <Title
        title="Latest Products"
        description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`}
        href="/shop"
      />
      <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between">
        {latestProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
