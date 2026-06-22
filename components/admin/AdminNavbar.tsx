import Link from "next/link";
import { ThemeToggler } from "../ThemeToggler";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

const AdminNavbar = async () => {
  const user = await currentUser();
  return (
    <div className="flex items-center justify-between px-2 py-3 sm:px-12 sm:py-3 border-b border-slate-200 dark:border-slate-800 transition-all">
      <Link
        href="/"
        className="hidden sm:block relative text-4xl font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className="text-green-600">Go</span>Cart
        <span className="text-green-600 text-5xl leading-none">.</span>
        <span className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
          Admin
        </span>
      </Link>
      {/* Mobile User Logo */}
      <Link
        href="/"
        className="block sm:hidden relative text-4xl font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className="text-green-600">G</span>C
        <span className="text-green-600 text-5xl leading-none">.</span>
        <span className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
          Admin
        </span>
      </Link>
      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 space-x-1">
        <ThemeToggler />
        {user?.firstName ?? "Admin"}
        <UserButton />
      </div>
    </div>
  );
};

export default AdminNavbar;
