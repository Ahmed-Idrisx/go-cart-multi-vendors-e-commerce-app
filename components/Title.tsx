import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Title {
  title: string;
  description: string;
  visibleButton?: boolean;
  href?: string;
}

export default function Title({
  title,
  description,
  visibleButton = true,
  href = "",
}: Title) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-5 text-sm text-slate-600 dark:text-slate-300 mt-2"
      >
        <p className="max-w-lg text-center">{description}</p>
        {visibleButton && (
          <button className="text-green-500 hover:text-green-600 flex items-center gap-1 transition-colors">
            View more <ArrowRight size={14} />
          </button>
        )}
      </Link>
    </div>
  );
}
