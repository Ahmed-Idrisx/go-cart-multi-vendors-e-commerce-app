"use client";
import { ArrowRight, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types/types";

const ProductDescription = ({ product }: { product: Product }) => {
  const [selectedTab, setSelectedTab] = useState("Description");

  return (
    <div className="my-16 text-sm text-slate-600 dark:text-slate-400">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 max-w-2xl">
        {["Description", "Reviews"].map((tab, index) => (
          <button
            className={`px-3 py-2 font-medium transition-colors ${
              tab === selectedTab
                ? "border-b-2 border-slate-800 dark:border-slate-100 text-slate-800 dark:text-slate-100 font-semibold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            key={index}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Description */}
      {selectedTab === "Description" && (
        <p className="max-w-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Reviews */}
      {selectedTab === "Reviews" && (
        <div className="flex flex-col gap-3 mt-14">
          {product.rating.map((item) => (
            <div key={item.id} className="flex gap-5 mb-10">
              <Image
                src={item.user?.image as string}
                alt={item.user?.name || "user image"}
                className="w-10 h-10 rounded-full object-cover"
                width={100}
                height={100}
              />
              <div>
                <div className="flex items-center">
                  {Array(5)
                    .fill("")
                    .map((_, i) => (
                      <StarIcon
                        key={i}
                        size={18}
                        className="text-transparent mt-0.5"
                        fill={item.rating >= i + 1 ? "#00C950" : "#D1D5DB"}
                      />
                    ))}
                </div>
                <p className="text-sm max-w-lg my-4 text-slate-600 dark:text-slate-400">
                  {item.review}
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {item.user?.name}
                </p>
                <p className="mt-3 font-light text-slate-500 dark:text-slate-500">
                  {new Date(item.createdAt).toDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store Section */}
      <div className="flex gap-3 mt-14 items-center">
        <Image
          src={product.store.logo as string}
          alt={product.store.name || "product name"}
          className="w-11 h-11 rounded-full object-cover ring-1 ring-green-400"
          width={100}
          height={100}
        />
        <div>
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Product by {product.store.name}
          </p>
          <Link
            href={`/shop/${product.store.username}`}
            className="flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:underline"
          >
            View store <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
