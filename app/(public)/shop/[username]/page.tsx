import ProductCard from "@/components/ProductCard";
import { MailIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import prisma from "@/lib/prisma";

const StoreShop = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;
  const store = await prisma.store.findFirst({
    where: {
      username: username,
      isActive: true,
    },
    include: {
      Product: {
        include: {
          rating: true,
        },
      },
    },
  });
  return (
    <div className="min-h-[70vh] mx-6 ">
      {/* Store Info */}
      {store && (
        <div className="max-w-7xl mx-auto mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-sm dark:shadow-none">
          <Image
            src={store.logo}
            alt={store.name}
            width={200}
            height={200}
            className="size-32 sm:size-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
          />

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              {store.name}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg leading-relaxed">
              {store.description}
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{store.address}</span>
              </div>

              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{store.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto mb-40">
        <h1 className="text-2xl mt-12 text-slate-900 dark:text-white">
          Shop{" "}
          <span className="font-medium text-green-600 dark:text-green-400">
            Products
          </span>
        </h1>

        <div className="mt-6 grid grid-cols-2 sm:flex flex-wrap justify-between gap-6 ">
          {(store?.Product ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreShop;
