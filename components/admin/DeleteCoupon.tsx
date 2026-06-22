"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteCoupon({ code }: { code: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    const loadingToastId = toast.loading("Deleting coupon...");

    try {
      const res = await fetch(`/api/admin/coupon?code=${code}`, {
        method: "DELETE",
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
      setIsDeleting(false);
    }
  };

  return (
    <Trash2Icon
      onClick={handleDelete}
      className={`w-5 h-5 text-red-500 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    />
  );
}
