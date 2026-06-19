"use client";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { Store } from "@/types/types";

const StoreInfo = ({ store }: { store: Store }) => {
  return (
    <div className="flex-1 space-y-2 text-sm">
      <Image
        width={100}
        height={100}
        src={store.logo}
        alt={store.name}
        className="max-w-20 max-h-20 object-contain shadow rounded-full max-sm:mx-auto"
      />
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {store.name}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          @{store.username}
        </span>

        {/* Status Badge */}
        <span
          className={`text-xs font-semibold px-4 py-1 rounded-full ${
            store.status === "pending"
              ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
              : store.status === "rejected"
                ? "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
                : "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
          }`}
        >
          {store.status}
        </span>
      </div>

      <p className="text-slate-600 dark:text-slate-300 my-5 max-w-2xl">
        {store.description}
      </p>
      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <MapPin size={16} /> {store.address}
      </p>
      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <Phone size={16} /> {store.contact}
      </p>
      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <Mail size={16} /> {store.email}
      </p>
      <p className="text-slate-700 dark:text-slate-300 mt-5">
        Applied on{" "}
        <span className="text-xs">
          {new Date(store.createdAt).toLocaleDateString()}
        </span>{" "}
        by
      </p>
      {store.user && (
        <div className="flex items-center gap-2 text-sm">
          <Image
            width={36}
            height={36}
            src={store.user.image}
            alt={store.user.name}
            className="w-9 h-9 rounded-full"
          />
          <div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {store.user.name}
            </p>
            <p className="text-slate-400 dark:text-slate-500">
              {store.user.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreInfo;
