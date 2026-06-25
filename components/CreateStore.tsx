"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface StoreInfoState {
  name: string;
  username: string;
  description: string;
  email: string;
  contact: string;
  address: string;
  image: File | null;
}

export default function CreateStore({
  initialStatus,
}: {
  initialStatus: string;
}) {
  const router = useRouter();
  const [alreadySubmitted, setAlreadySubmitted] = useState(
    initialStatus !== "not registered",
  );
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [storeInfo, setStoreInfo] = useState<StoreInfoState>({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    image: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setStoreInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStoreInfo((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const imagePreview =
    storeInfo.image instanceof File
      ? URL.createObjectURL(storeInfo.image)
      : "/upload_area.svg";

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Submitting data...");
    try {
      const formData = new FormData();
      formData.append("name", storeInfo.name);
      formData.append("username", storeInfo.username);
      formData.append("description", storeInfo.description);
      formData.append("email", storeInfo.email);
      formData.append("contact", storeInfo.contact);
      formData.append("address", storeInfo.address);
      if (storeInfo.image) formData.append("image", storeInfo.image);

      const res = await fetch("/api/store/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(data.message, { id: loadingToastId });

      setStatus(data.status ?? "pending");
      setAlreadySubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message, { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (status === "approved") {
      const timer = setTimeout(() => {
        router.push("/store");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <>
      {!alreadySubmitted ? (
        <div className="mx-6 min-h-[70vh] my-16">
          <form
            onSubmit={onSubmitHandler}
            className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500 dark:text-slate-300"
          >
            {/* Title */}
            <div>
              <h1 className="text-3xl text-slate-900 dark:text-slate-100">
                Add Your <span className="font-medium">Store</span>
              </h1>

              <p className="max-w-lg text-slate-600 dark:text-slate-400">
                To become a seller on GoCart, submit your store details for
                review. Your store will be activated after admin verification.
              </p>
            </div>

            <label className="mt-10 cursor-pointer text-slate-700 dark:text-slate-300">
              Store Logo
              <Image
                src={imagePreview}
                className="rounded-lg mt-2 h-16 w-auto border border-transparent dark:border-slate-700"
                alt=""
                width={150}
                height={100}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                hidden
              />
            </label>

            <p className="text-slate-700 dark:text-slate-300">Username</p>
            <input
              name="username"
              onChange={handleChange}
              value={storeInfo.username}
              type="text"
              placeholder="Enter your store username"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-slate-400 dark:outline-slate-600 w-full max-w-lg p-2 rounded"
            />

            <p className="text-slate-700 dark:text-slate-300">Name</p>
            <input
              name="name"
              onChange={handleChange}
              value={storeInfo.name}
              type="text"
              placeholder="Enter your store name"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-slate-400 dark:outline-slate-600 w-full max-w-lg p-2 rounded"
            />

            <p className="text-slate-700 dark:text-slate-300">Description</p>
            <textarea
              name="description"
              onChange={handleChange}
              value={storeInfo.description}
              rows={5}
              placeholder="Enter your store description"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-slate-400 dark:outline-slate-600 w-full max-w-lg p-2 rounded resize-none"
            />

            <p className="text-slate-700 dark:text-slate-300">Email</p>
            <input
              name="email"
              onChange={handleChange}
              value={storeInfo.email}
              type="email"
              placeholder="Enter your store email"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-slate-400 dark:outline-slate-600 w-full max-w-lg p-2 rounded"
            />

            <p className="text-slate-700 dark:text-slate-300">Contact Number</p>
            <input
              name="contact"
              onChange={handleChange}
              value={storeInfo.contact}
              type="text"
              placeholder="Enter your store contact number"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-slate-400 dark:outline-slate-600 w-full max-w-lg p-2 rounded"
            />

            <p className="text-slate-700 dark:text-slate-300">Address</p>
            <textarea
              name="address"
              onChange={handleChange}
              value={storeInfo.address}
              rows={5}
              placeholder="Enter your store address"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-slate-400 dark:outline-slate-600 w-full max-w-lg p-2 rounded resize-none"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-800 dark:bg-green-600 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 dark:hover:bg-green-700 transition"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      ) : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">
            {status === "pending" &&
              "Your store request is pending, please wait for admin to approve your store"}
            {status === "approved" &&
              "Your store has been approved, you can now add products to your store from dashboard"}
            {status === "rejected" &&
              "Your store request has been rejected, contact the admin for more details"}
          </p>
          {status === "approved" && (
            <p className="mt-5 text-slate-400">
              redirecting to dashboard in{" "}
              <span className="font-semibold">5 seconds</span>
            </p>
          )}
        </div>
      )}
    </>
  );
}
