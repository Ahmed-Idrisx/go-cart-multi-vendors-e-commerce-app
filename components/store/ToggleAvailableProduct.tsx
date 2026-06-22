"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ToggleAvailableProduct = ({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toggleStock = async () => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Updating...");
    try {
      const res = await fetch("/api/store/stock-toggle", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      toast.success(data.message, { id: loadingToastId });

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
    <input
      disabled={isSubmitting}
      type="checkbox"
      className="sr-only peer"
      onChange={toggleStock}
      checked={inStock}
    />
  );
};

export default ToggleAvailableProduct;
