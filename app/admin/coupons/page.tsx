"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Trash2Icon } from "lucide-react";
import { couponDummyData } from "@/assets/assets";
import { Coupon } from "@/types/types";

interface NewCouponState {
  code: string;
  description: string;
  discount: string | number;
  forNewUser: boolean;
  forMember: boolean;
  isPublic: boolean;
  expiresAt: Date;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [newCoupon, setNewCoupon] = useState<NewCouponState>({
    code: "",
    description: "",
    discount: "",
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date(),
  });

  const fetchCoupons = async () => {
    setCoupons(couponDummyData);
  };

  const handleAddCoupon = async (e: FormEvent) => {
    e.preventDefault();
    // Logic to add a coupon
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "expiresAt") {
      setNewCoupon((prev) => ({ ...prev, [name]: new Date(value) }));
    } else {
      setNewCoupon((prev) => ({ ...prev, [name]: value }));
    }
  };

  const deleteCoupon = async (code: string) => {
    // Logic to delete a coupon
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="text-slate-500 dark:text-slate-400 mb-40">
      {/* Add Coupon */}
      <form
        onSubmit={(e) =>
          toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })
        }
        className="max-w-sm text-sm"
      >
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
            className="w-full mt-2 p-2 border border-slate-200 dark:border-slate-700 outline-slate-400 dark:outline-slate-500 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
            className="w-full mt-2 p-2 border border-slate-200 dark:border-slate-700 outline-slate-400 dark:outline-slate-500 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            name="discount"
            value={newCoupon.discount}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Coupon Description"
          className="w-full mt-2 p-2 border border-slate-200 dark:border-slate-700 outline-slate-400 dark:outline-slate-500 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
            className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 outline-slate-400 dark:outline-slate-500 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            name="expiresAt"
            value={format(newCoupon.expiresAt, "yyyy-MM-dd")}
            onChange={handleChange}
          />
        </label>

        <div className="mt-5">
          <div className="flex gap-2 mt-3">
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 dark:text-slate-200 gap-3">
              <input
                type="checkbox"
                className="sr-only peer"
                name="forNewUser"
                checked={newCoupon.forNewUser}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
            </label>
            <p>For New User</p>
          </div>
          <div className="flex gap-2 mt-3">
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 dark:text-slate-200 gap-3">
              <input
                type="checkbox"
                className="sr-only peer"
                name="forMember"
                checked={newCoupon.forMember}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, forMember: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
            </label>
            <p>For Member</p>
          </div>
        </div>
        <button className="mt-4 p-2 px-10 rounded bg-slate-700 dark:bg-slate-600 text-white active:scale-95 transition hover:bg-slate-800 dark:hover:bg-slate-500">
          Add Coupon
        </button>
      </form>

      {/* List Coupons */}
      <div className="mt-14">
        <h2 className="text-2xl">
          List{" "}
          <span className="text-slate-800 dark:text-slate-100 font-medium">
            Coupons
          </span>
        </h2>
        <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 dark:border-slate-700 max-w-4xl">
          <table className="min-w-full bg-white dark:bg-slate-900 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Code
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Description
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Discount
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Expires At
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  New User
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  For Member
                </th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {coupons.map((coupon) => (
                <tr
                  key={coupon.code}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-100">
                    {coupon.code}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.description}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.discount}%
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {format(new Date(coupon.expiresAt), "yyyy-MM-dd")}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.forNewUser ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {coupon.forMember ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    <Trash2Icon
                      onClick={() =>
                        toast.promise(deleteCoupon(coupon.code), {
                          loading: "Deleting coupon...",
                        })
                      }
                      className="w-5 h-5 text-red-500 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
