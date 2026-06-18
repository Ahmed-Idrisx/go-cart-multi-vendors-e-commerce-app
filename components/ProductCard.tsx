import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/types";

export default function ProductCard({ product }: { product: Product }) {
  const rating =
    product.rating && product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length,
        )
      : 0;

  return (
    <div className="group relative max-xl:mx-auto w-full sm:w-60 flex flex-col">
      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="bg-gray-100 dark:bg-slate-800 h-40 sm:h-64 rounded-lg flex items-center justify-center relative overflow-hidden transition duration-300">
          {product.images && product.images[0] && (
            <Image
              width={500}
              height={500}
              className="max-h-30 sm:max-h-40 w-auto group-hover:scale-105 transition duration-300 object-contain"
              src={product.images[0] as string}
              alt={product.name}
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-3 text-sm text-slate-800 dark:text-slate-200 pt-2 max-w-60">
          <div>
            <p className="font-medium truncate max-w-35 sm:max-w-45">
              {product.name}
            </p>
            <div className="flex mt-1">
              {Array(5)
                .fill("")
                .map((_, index) => (
                  <StarIcon
                    key={index}
                    size={14}
                    className="text-transparent"
                    fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                  />
                ))}
            </div>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">
            ${product.price}
          </p>
        </div>
      </Link>
    </div>
  );
}
