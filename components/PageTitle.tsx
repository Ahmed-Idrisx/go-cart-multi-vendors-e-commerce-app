import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

interface PageTitleProps {
  heading: string;
  text: string;
  path?: string;
  linkText?: string;
}

export default function PageTitle({
  heading,
  text,
  path = "/shop",
  linkText,
}: PageTitleProps) {
  return (
    <div className="my-6">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
        {heading}
      </h2>
      <div className="flex items-center gap-3">
        <p className="text-slate-600 dark:text-slate-350">{text}</p>
        {linkText && (
          <Link
            href={path}
            className="flex items-center gap-1 text-green-500 hover:text-green-600 text-sm transition-colors"
          >
            {linkText} <ArrowRightIcon size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
