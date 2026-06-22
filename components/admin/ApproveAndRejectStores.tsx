"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const ApproveAndRejectStores = ({ storeId }: { storeId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const handleApprove = async (status: string) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Updating...");
    try {
      const res = await fetch("/api/admin/approve-store", {
        method: "POST",
        body: JSON.stringify({
          storeId,
          status,
        }),
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
    <>
      <button
        disabled={isSubmitting}
        onClick={() => handleApprove("approved")}
        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 text-sm"
      >
        Approve
      </button>
      <button
        disabled={isSubmitting}
        onClick={() => handleApprove("rejected")}
        className="px-4 py-2 bg-slate-500 dark:bg-slate-600 text-white rounded hover:bg-slate-600 dark:hover:bg-slate-500 text-sm"
      >
        Reject
      </button>
    </>
  );
};

export default ApproveAndRejectStores;
