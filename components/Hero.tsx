import { assets } from "@/assets/assets";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import CategoriesMarquee from "./CategoriesMarquee";

export default function Hero() {
  return (
    <div className="mx-6">
      <div className="flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10">
        <div className="relative flex-1 flex flex-col bg-green-200 dark:bg-green-950/40 rounded-3xl xl:min-h-100 group transition-colors duration-200">
          <div className="p-5 sm:p-16">
            <div className="inline-flex items-center gap-3 bg-green-300 dark:bg-green-900/30 text-green-600 dark:text-green-300 pr-4 p-1 rounded-full text-xs sm:text-sm">
              <span className="bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs">
                NEWS
              </span>{" "}
              Free Shipping on Orders Above $50!{" "}
              <ChevronRightIcon
                className="group-hover:translate-x-1 transition-transform"
                size={16}
              />
            </div>
            <h2 className="text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-linear-to-r from-slate-800 to-green-700 dark:from-white dark:to-green-400 bg-clip-text text-transparent max-w-xs sm:max-w-md">
              Gadgets you&apos;ll love. Prices you&apos;ll trust.
            </h2>
            <div className="text-slate-800 dark:text-slate-200 text-sm font-medium mt-4 sm:mt-8">
              <p>Starts from</p>
              <p className="text-3xl font-bold">$4.90</p>
            </div>
            <button className="bg-slate-800 dark:bg-green-600 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 dark:hover:bg-green-700 hover:scale-103 active:scale-95 transition-all">
              LEARN MORE
            </button>
          </div>
          {assets.hero_model_img && (
            <Image
              className="sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-10 w-full sm:max-w-sm object-contain mt-4 sm:mt-0"
              src={assets.hero_model_img}
              alt=""
              width={400}
              height={400}
              priority
            />
          )}
        </div>
        <div className="flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600 dark:text-slate-100">
          <div className="flex-1 flex items-center justify-between w-full bg-orange-200 dark:bg-orange-950/30 rounded-3xl p-6 px-8 group transition-colors duration-200">
            <div>
              <p className="text-3xl font-medium bg-linear-to-r from-slate-800 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent max-w-40">
                Best products
              </p>
              <p className="flex items-center gap-1 mt-4 text-slate-800 dark:text-slate-200 cursor-pointer">
                View more{" "}
                <ArrowRightIcon
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />{" "}
              </p>
            </div>
            {assets.hero_product_img1 && (
              <Image
                className="w-35 object-contain"
                src={assets.hero_product_img1}
                alt=""
                width={140}
                height={140}
              />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between w-full bg-blue-200 dark:bg-blue-950/30 rounded-3xl p-6 px-8 group transition-colors duration-200">
            <div>
              <p className="text-3xl font-medium bg-linear-to-r from-slate-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent max-w-40">
                20% discounts
              </p>
              <p className="flex items-center gap-1 mt-4 text-slate-800 dark:text-slate-200 cursor-pointer">
                View more{" "}
                <ArrowRightIcon
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />{" "}
              </p>
            </div>
            {assets.hero_product_img2 && (
              <Image
                className="w-35 object-contain"
                src={assets.hero_product_img2}
                alt=""
                width={140}
                height={140}
              />
            )}
          </div>
        </div>
      </div>
      <CategoriesMarquee />
    </div>
  );
}
