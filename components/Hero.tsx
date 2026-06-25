import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import CategoriesMarquee from "./CategoriesMarquee";

export default function Hero() {
  return (
    <div className="mx-4 sm:mx-6">
      <div className="flex flex-wrap xl:flex-nowrap gap-5 sm:gap-8 max-w-7xl mx-auto my-6 sm:my-10">
        {/* Main banner */}
        <div className="w-full xl:flex-1 p-6 sm:p-10 flex flex-col sm:flex-row flex-wrap items-center justify-center bg-green-200 dark:bg-green-900/40 rounded-3xl overflow-hidden">
          {/* Text */}
          <div className="flex-1 min-w-57.5">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-green-300 dark:bg-green-900/30 text-green-600 dark:text-green-300 pr-3 sm:pr-4 p-1 rounded-full text-xs sm:text-sm">
              <span className="bg-green-600 px-2.5 sm:px-3 py-1 rounded-full text-white text-xs whitespace-nowrap">
                NEWS
              </span>
              Free Shipping on Orders Above $50!
              <ChevronRightIcon
                className="group-hover:translate-x-1 transition-transform shrink-0"
                size={16}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-[1.2] my-3 sm:my-4 font-medium bg-linear-to-r from-slate-800 to-green-700 dark:from-white dark:to-green-400 bg-clip-text text-transparent max-w-md">
              Gadgets you&apos;ll love. Prices you&apos;ll trust.
            </h2>

            <div className="text-slate-800 dark:text-slate-200 text-sm font-medium mt-4 sm:mt-6">
              <p>Starts from</p>
              <p className="text-2xl sm:text-3xl font-bold">$4.90</p>
            </div>

            <button className="bg-slate-800 dark:bg-green-600 text-white py-2.5 sm:py-3 px-6 sm:px-8 mt-4 sm:mt-6 rounded-md hover:bg-slate-900 dark:hover:bg-green-700 transition text-sm sm:text-base">
              LEARN MORE
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 min-w-45 flex justify-center mt-6 sm:mt-0">
            <Image
              src="/hero_model_img.png"
              alt="Hero"
              width={320}
              height={320}
              priority
              className="w-40 sm:w-48 lg:w-56 xl:w-64 h-auto object-contain"
            />
          </div>
        </div>

        {/* Side cards */}
        <div className="flex flex-wrap sm:flex-nowrap xl:flex-wrap gap-4 sm:gap-5 w-full xl:w-auto xl:max-w-sm text-sm text-slate-600 dark:text-slate-100">
          <div className="flex-1 min-w-65 flex items-center justify-between gap-3 bg-orange-200 dark:bg-orange-900/30 rounded-3xl p-5 sm:p-6 group transition-colors duration-200">
            <div>
              <p className="text-2xl sm:text-3xl font-medium bg-linear-to-r from-slate-800 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent max-w-40">
                Best products
              </p>
              <p className="flex items-center gap-1 mt-3 sm:mt-4 text-slate-800 dark:text-slate-200 cursor-pointer">
                View more{" "}
                <ArrowRightIcon
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </p>
            </div>

            <Image
              className="w-20 sm:w-24 lg:w-28 object-contain shrink-0"
              src="/hero_product_img1.png"
              alt=""
              width={112}
              height={112}
            />
          </div>

          <div className="flex-1 min-w-65 flex items-center justify-between gap-3 bg-blue-200 dark:bg-blue-900/30 rounded-3xl p-5 sm:p-6 group transition-colors duration-200">
            <div>
              <p className="text-2xl sm:text-3xl font-medium bg-linear-to-r from-slate-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent max-w-40">
                20% discounts
              </p>
              <p className="flex items-center gap-1 mt-3 sm:mt-4 text-slate-800 dark:text-slate-200 cursor-pointer">
                Claim Offer{" "}
                <ArrowRightIcon
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </p>
            </div>

            <Image
              className="w-20 sm:w-24 lg:w-28 object-contain shrink-0"
              src="/hero_product_img2.png"
              alt=""
              width={112}
              height={112}
            />
          </div>
        </div>
      </div>
      <CategoriesMarquee />
    </div>
  );
}
