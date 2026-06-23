"use client";

import { PlusIcon, SquarePenIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Address, Coupon, PaymentMethod, Product } from "@/types/types";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import AddressModal from "./AddressModal";
import { Protect, useUser } from "@clerk/nextjs";
import { fetchCart } from "@/lib/features/cart/cartSlice";

interface OrderSummaryProps {
  totalPrice: number;
  items: (Product & { quantity: number })[];
}

export default function OrderSummary({ totalPrice, items }: OrderSummaryProps) {
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const addressList = useAppSelector((state) => state.address.list);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCouponCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Verifying coupon...");
    try {
      if (!user) {
        return toast.error("Please login to proceed", { id: loadingToastId });
      }
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCodeInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      toast.success("Coupon applied successfully", { id: loadingToastId });
      setCoupon(data.coupon);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid coupon code";
      toast.error(message, { id: loadingToastId });
      setCoupon(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Placing order...");
    try {
      if (!user) {
        return toast.error("Please login to proceed", { id: loadingToastId });
      }
      if (!selectedAddress) {
        return toast.error("Please select an address", { id: loadingToastId });
      }

      const orderData = {
        addressId: selectedAddress.id,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        ...(coupon ? { couponCode: coupon.code } : {}),
      };

      // create order

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      if (paymentMethod === "STRIPE") {
        window.location.href = data.session.url;
      } else {
        toast.success(data.message, { id: loadingToastId });
        router.push("/orders");
        dispatch(fetchCart());
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid coupon code";
      toast.error(message, { id: loadingToastId });
      setCoupon(null);
    } finally {
      setIsSubmitting(false);
    }
  };
  const discountAmount = coupon ? (coupon.discount / 100) * totalPrice : 0;
  const finalTotalForPlusUser = coupon
    ? (totalPrice - discountAmount).toFixed(2)
    : totalPrice.toLocaleString();
  const finalTotalForRegularUser = coupon
    ? (totalPrice + 5 - discountAmount).toFixed(2)
    : (totalPrice + 5).toLocaleString();

  return (
    <div className="w-full max-w-lg lg:max-w-sm bg-slate-50/30 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 text-sm rounded-xl p-7 transition-colors">
      <h2 className="text-xl font-medium text-slate-700 dark:text-slate-100">
        Payment Summary
      </h2>

      <p className="text-slate-400 dark:text-slate-400 text-xs my-4">
        Payment Method
      </p>

      <div className="flex gap-2 items-center">
        <input
          type="radio"
          id="COD"
          name="payment"
          onChange={() => setPaymentMethod("COD")}
          checked={paymentMethod === "COD"}
          className="accent-green-500"
        />
        <label
          htmlFor="COD"
          className="cursor-pointer text-slate-700 dark:text-slate-200"
        >
          COD (Cash on Delivery)
        </label>
      </div>
      <div className="flex gap-2 items-center mt-1">
        <input
          type="radio"
          id="STRIPE"
          name="payment"
          onChange={() => setPaymentMethod("STRIPE")}
          checked={paymentMethod === "STRIPE"}
          className="accent-green-500"
        />
        <label
          htmlFor="STRIPE"
          className="cursor-pointer text-slate-700 dark:text-slate-200"
        >
          Stripe Payment
        </label>
      </div>

      <div className="my-4 py-4 border-y border-slate-200 dark:border-slate-700 text-slate-400">
        <p className="text-xs mb-2">Delivery Address</p>
        {selectedAddress ? (
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <div className="flex-1 pr-2">
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                {selectedAddress.name}
              </p>
              <p className="text-[11px] leading-relaxed truncate max-w-50">
                {selectedAddress.street}, {selectedAddress.city},{" "}
                {selectedAddress.state}, {selectedAddress.zip}
              </p>
            </div>
            <SquarePenIcon
              onClick={() => setSelectedAddress(null)}
              className="cursor-pointer text-slate-500 hover:text-green-500 transition-colors"
              size={18}
            />
          </div>
        ) : (
          <div>
            {addressList.length > 0 && (
              <select
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white p-2.5 w-full my-3 outline-none rounded-lg text-slate-700"
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const foundAddress = addressList.find(
                    (addr) => addr.id === selectedId,
                  );
                  setSelectedAddress(foundAddress || null);
                }}
                defaultValue=""
              >
                <option value="">Select Address</option>
                {addressList.map((addr, index) => (
                  <option key={addr.id ?? index} value={addr.id}>
                    {addr.name}, {addr.city}, {addr.state}, {addr.zip}
                  </option>
                ))}
              </select>
            )}
            <button
              className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition font-medium mt-1"
              onClick={() => setShowAddressModal(true)}
            >
              Add Address <PlusIcon size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-xs">
          <div className="flex flex-col gap-1.5 text-slate-400">
            <p>Subtotal:</p>
            <p>Shipping:</p>
            {coupon && <p>Coupon:</p>}
          </div>
          <div className="flex flex-col gap-1.5 font-medium text-right text-slate-800 dark:text-slate-100">
            <p>${totalPrice.toLocaleString()}</p>
            <p>
              <Protect plan="plus" fallback={`$5`}>
                Free
              </Protect>
            </p>
            {coupon && (
              <p className="text-red-500">-${discountAmount.toFixed(2)}</p>
            )}
          </div>
        </div>

        {!coupon ? (
          <form
            onSubmit={handleCouponCode}
            className="flex justify-center gap-3 mt-4"
          >
            <input
              onChange={(e) => setCouponCodeInput(e.target.value)}
              value={couponCodeInput}
              type="text"
              placeholder="Coupon code"
              aria-label="Coupon code"
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white p-2 text-xs rounded w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-700 dark:bg-green-600 text-white px-4 rounded text-xs hover:bg-slate-800 dark:hover:bg-green-700 active:scale-95 transition-all"
            >
              {isSubmitting ? "APPLYING..." : "APPLY"}
            </button>
          </form>
        ) : (
          <div className="w-full flex items-center justify-between gap-2 text-xs mt-3 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 p-2.5 rounded-lg border border-green-100 dark:border-green-900/30">
            <div>
              <p className="font-semibold">Code: {coupon.code.toUpperCase()}</p>
              <p className="text-[10px] text-green-600 dark:text-green-400">
                {coupon.description}
              </p>
            </div>
            <XIcon
              size={18}
              onClick={() => setCoupon(null)}
              className="hover:text-red-600 transition cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between py-4 text-slate-800 dark:text-slate-100 font-semibold">
        <p>Total:</p>
        <Protect plan="plus" fallback={"$" + finalTotalForRegularUser}>
          <p className="text-right">${finalTotalForPlusUser}</p>
        </Protect>
      </div>

      <button
        disabled={isSubmitting}
        onClick={handlePlaceOrder}
        className="w-full bg-slate-800 dark:bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 dark:hover:bg-green-700 active:scale-95 transition-all shadow-md"
      >
        {isSubmitting ? "Placing..." : "Place Order"}
      </button>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </div>
  );
}
