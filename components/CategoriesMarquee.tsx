const categories = [
  "Headphones",
  "Speakers",
  "Watch",
  "Earbuds",
  "Mouse",
  "Decoration",
] as const;
export default function CategoriesMarquee() {
  return (
    <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
      <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-linear-to-r from-white to-transparent dark:from-slate-900 dark:to-transparent" />
      <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:paused gap-4">
        {[...categories, ...categories, ...categories, ...categories].map(
          (category, index) => (
            <button
              key={index}
              className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs sm:text-sm hover:bg-slate-600 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white active:scale-95 transition-all duration-300 border border-transparent dark:border-slate-700"
            >
              {category}
            </button>
          ),
        )}
      </div>
      <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-linear-to-l from-white to-transparent dark:from-slate-900 dark:to-transparent" />
    </div>
  );
}
