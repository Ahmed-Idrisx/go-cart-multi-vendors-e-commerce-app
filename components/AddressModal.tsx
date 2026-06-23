"use client";

import React, { useState } from "react";
import { XIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "@/hooks/hooks";
import { addAddress } from "@/lib/features/address/addressSlice";

interface AddressModalProps {
  setShowAddressModal: (show: boolean) => void;
}

export default function AddressModal({
  setShowAddressModal,
}: AddressModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Adding address...");
    try {
      const res = await fetch("/api/address", {
        method: "POST",
        body: JSON.stringify({ address }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      dispatch(addAddress(data.newAddress));
      toast.success(data.message, { id: loadingToastId });
      setShowAddressModal(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message, { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 text-slate-700 dark:text-slate-200 w-full max-w-md mx-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-gray-150 dark:border-slate-700 relative"
      >
        <button
          type="button"
          onClick={() => setShowAddressModal(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <XIcon size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-2">
          Add New <span className="text-green-600">Address</span>
        </h2>

        <input
          name="name"
          onChange={handleAddressChange}
          value={address.name}
          className="py-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          type="text"
          placeholder="Enter your name"
          required
        />
        <input
          name="email"
          onChange={handleAddressChange}
          value={address.email}
          className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          type="email"
          placeholder="Email address"
          required
        />
        <input
          name="street"
          onChange={handleAddressChange}
          value={address.street}
          className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          type="text"
          placeholder="Street"
          required
        />
        <div className="flex gap-4">
          <input
            name="city"
            onChange={handleAddressChange}
            value={address.city}
            className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            type="text"
            placeholder="City"
            required
          />
          <input
            name="state"
            onChange={handleAddressChange}
            value={address.state}
            className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            type="text"
            placeholder="State"
            required
          />
        </div>
        <div className="flex gap-4">
          <input
            name="zip"
            onChange={handleAddressChange}
            value={address.zip}
            className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            type="text"
            placeholder="Zip code"
            required
          />
          <input
            name="country"
            onChange={handleAddressChange}
            value={address.country}
            className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            type="text"
            placeholder="Country"
            required
          />
        </div>
        <input
          name="phone"
          onChange={handleAddressChange}
          value={address.phone}
          className="p-2.5 px-4 outline-none border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          type="text"
          placeholder="Phone"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-slate-800 dark:bg-green-600 hover:bg-slate-900 dark:hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-md active:scale-95 transition-all shadow-md mt-2"
        >
          {isSubmitting ? "SAVING..." : "SAVE ADDRESS"}
        </button>
      </form>
    </div>
  );
}
