"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface NewCouponState {
  code: string;
  description: string;
  discount: string | number;
  forNewUser: boolean;
  forMember: boolean;
  isPublic: boolean;
  expiresAt: Date;
}

export default function AddCouponForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCoupon, setNewCoupon] = useState<NewCouponState>({
    code: "",
    description: "",
    discount: "",
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date(),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "expiresAt") {
      setNewCoupon((prev) => ({ ...prev, [name]: new Date(value) }));
    } else {
      setNewCoupon((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCoupon = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Adding coupon...");

    try {
      const res = await fetch("/api/admin/coupon", {
        method: "POST",
        body: JSON.stringify({
          coupon: {
            ...newCoupon,
            discount: Number(newCoupon.discount),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(data.message, { id: loadingToastId });

      setNewCoupon({
        code: "",
        description: "",
        discount: "",
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date(),
      });

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message, { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleAddCoupon} className="max-w-sm text-sm">
      <h2 className="text-2xl">
        Add{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Coupons
        </span>
      </h2>
      <div className="flex gap-2 max-sm:flex-col mt-2">
        <input
          type="text"
          placeholder="Coupon Code"
          className="w-full mt-2 p-2 border border-slate-200 dark:border-slate-700 outline-none rounded-md bg-white dark:bg-slate-900  placeholder:text-slate-400 dark:placeholder:text-slate-500"
          name="code"
          value={newCoupon.code}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          placeholder="Coupon Discount (%)"
          min={1}
          max={100}
          className="w-full mt-2 p-2 border border-slate-200 dark:border-slate-700 outline-none rounded-md bg-white dark:bg-slate-900  placeholder:text-slate-400 dark:placeholder:text-slate-500"
          name="discount"
          value={newCoupon.discount}
          onChange={handleChange}
          required
        />
      </div>
      <input
        type="text"
        placeholder="Coupon Description"
        className="w-full mt-2 p-2 border border-slate-200 dark:border-slate-700 outline-none rounded-md bg-white dark:bg-slate-900  placeholder:text-slate-400 dark:placeholder:text-slate-500"
        name="description"
        value={newCoupon.description}
        onChange={handleChange}
        required
      />

      <label className="text-slate-700 dark:text-slate-300">
        <p className="mt-3">Coupon Expiry Date</p>
        <input
          type="date"
          placeholder="Coupon Expires At"
          className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 outline-none rounded-md bg-white dark:bg-slate-900"
          name="expiresAt"
          value={format(newCoupon.expiresAt, "yyyy-MM-dd")}
          onChange={handleChange}
        />
      </label>

      <div className="mt-5">
        <div className="flex gap-2 mt-3">
          <label className="relative inline-flex items-center cursor-pointer  gap-3">
            <input
              type="checkbox"
              className="sr-only peer"
              name="forNewUser"
              checked={newCoupon.forNewUser}
              onChange={(e) =>
                setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })
              }
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-green-600 dark:peer-checked:bg-green-500 transition-colors duration-200"></div>
            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
          </label>
          <p>For New User</p>
        </div>
        <div className="flex gap-2 mt-3">
          <label className="relative inline-flex items-center cursor-pointer gap-3">
            <input
              type="checkbox"
              className="sr-only peer"
              name="forMember"
              checked={newCoupon.forMember}
              onChange={(e) =>
                setNewCoupon({ ...newCoupon, forMember: e.target.checked })
              }
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-green-600 dark:peer-checked:bg-green-500 transition-colors duration-200"></div>
            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
          </label>
          <p>For Member</p>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 py-2 px-10 rounded bg-slate-700 dark:bg-slate-600 text-white active:scale-95 transition hover:bg-slate-800 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Adding..." : "Add Coupon"}
      </button>
    </form>
  );
}
