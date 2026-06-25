import ProductCard from "@/components/ProductCard";
import { Suspense } from "react";
import { MoveLeftIcon, SearchXIcon } from "lucide-react";
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
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.category?.toLowerCase().includes(search.toLowerCase()),
      )
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

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-24 text-slate-400 dark:text-slate-500">
            <SearchXIcon size={48} className="opacity-60" />
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
              No products found
            </p>
            {search && (
              <p className="text-sm">
                We couldn&apos;t find any results for{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  &quot;{search}&quot;
                </span>
              </p>
            )}
            <Link
              href={"/shop"}
              className="mt-3 text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              View all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2  sm:flex flex-wrap justify-center gap-6 xl:gap-12 mx-auto mb-32">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
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
