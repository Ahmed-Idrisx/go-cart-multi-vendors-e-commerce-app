import ProductCard from "@/components/ProductCard";
import { Suspense } from "react";
import { MoveLeftIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

const ShopContent = async ({ search }: { search: string }) => {
  // get query params ?search=abc
  let products = await prisma.product.findMany({
    where: { inStock: true },
    include: {
      rating: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      store: true,
    },
    orderBy: { createdAt: "desc" },
  });
  // remove products with store isActive false
  products = products.filter((products) => products.store.isActive);

  const filteredProducts = search
    ? products.filter((product) => product.name.toLowerCase().includes(search))
    : products;

  return (
    <div className="min-h-[70vh] mx-6">
      <div className=" max-w-7xl mx-auto">
        <h1
          className={`text-2xl text-slate-500 my-6 flex items-center gap-2 ${search && "cursor-pointer"}`}
        >
          <Link href={"/shop"}>
            {search && <MoveLeftIcon size={20} />}All{" "}
            <span className="text-slate-700 font-medium">Products</span>
          </Link>
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
const Shop = async ({
  searchParams,
}: {
  searchParams: Promise<{ search: string }>;
}) => {
  const { search } = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-transparent dark:bg-slate-900 transition-colors">
          <div className="w-11 h-11 rounded-full border-3 border-gray-300 border-t-green-500 animate-spin"></div>
        </div>
      }
    >
      <ShopContent search={search} />
    </Suspense>
  );
};
export default Shop;
