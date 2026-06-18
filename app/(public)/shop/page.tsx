"use client";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/hooks";
import { Suspense } from "react";
import { MoveLeftIcon } from "lucide-react";

const ShopContent = () => {
  // get query params ?search=abc
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const router = useRouter();

  const products = useAppSelector((state) => state.product.list);
  const filteredProducts = search
    ? products.filter((product) => product.name.toLowerCase().includes(search))
    : products;

  return (
    <div className="min-h-[70vh] mx-6">
      <div className=" max-w-7xl mx-auto">
        <h1
          onClick={() => router.push("/shop")}
          className={`text-2xl text-slate-500 my-6 flex items-center gap-2 ${search && "cursor-pointer"}`}
        >
          {search && <MoveLeftIcon size={20} />}All{" "}
          <span className="text-slate-700 font-medium">Products</span>
        </h1>
        <div className="grid grid-cols-2  sm:flex flex-wrap justify-center gap-6 xl:gap-12 mx-auto mb-32">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
const Shop = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-transparent dark:bg-slate-900 transition-colors">
          <div className="w-11 h-11 rounded-full border-3 border-gray-300 border-t-green-500 animate-spin"></div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
};
export default Shop;
