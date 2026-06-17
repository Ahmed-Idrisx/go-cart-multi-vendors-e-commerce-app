"use client";

import { Search, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggler } from "./ThemeToggler";

export default function Navbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  return (
    <nav className="relative bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          <Link
            href="/"
            className="hidden sm:block relative text-4xl font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className="text-green-600">Go</span>Cart
            <span className="text-green-600 text-5xl leading-none">.</span>
            <span className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
              plus
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
              plus
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-slate-600 dark:text-slate-300">
            <Link
              href="/"
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/"
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/"
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Contact
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center w-xs text-sm gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-transparent dark:border-slate-700"
            >
              <Search
                size={18}
                className="text-slate-600 dark:text-slate-400"
              />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600 dark:placeholder-slate-400 text-slate-950 dark:text-slate-55"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>
            {/* Wishlist Link */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Heart size={18} />
              Wishlist
              <span className="absolute -top-1.5 left-3 text-[8px] text-white bg-rose-500 size-3.5 rounded-full flex items-center justify-center font-bold">
                4
              </span>
            </Link>
            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ShoppingCart size={18} />
              Cart
              <span className="absolute -top-1.5 left-3 text-[8px] text-white bg-green-600 size-3.5 rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </Link>

            <ThemeToggler />

            <button className="px-6 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full font-medium">
              Login
            </button>
          </div>

          {/* Mobile User Button / Controls */}
          <div className="flex sm:hidden items-center gap-3">
            <ThemeToggler />

            <button className="px-5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-xs transition text-white rounded-full font-medium">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
