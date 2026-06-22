"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const ToggleIsActive = ({
  storeId,
  isActive,
}: {
  storeId: string;
  isActive: boolean;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleIsActive = async () => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Updating...");
    try {
      const res = await fetch("/api/admin/toggle-store", {
        method: "POST",
        body: JSON.stringify({ storeId }),
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
      checked={isActive}
      onChange={toggleIsActive}
    />
  );
};

export default ToggleIsActive;
