"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-hot-toast";

type ImageSlotKey = "1" | "2" | "3" | "4";

type ImageSlots = Record<ImageSlotKey, File | null>;

export default function StoreAddProduct() {
  const categories: string[] = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Health",
    "Toys & Games",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Drink",
    "Hobbies & Crafts",
    "Others",
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImageSlots>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    mrp: 0,
    price: 0,
    category: "",
  });

  const onChangeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setProductInfo((prev) => ({
      ...prev,
      [name]: name === "mrp" || name === "price" ? Number(value) : value,
    }));
  };

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading("Submitting data...");

    try {
      const formData = new FormData();
      formData.append("name", productInfo.name);
      formData.append("description", productInfo.description);
      formData.append("mrp", String(productInfo.mrp));
      formData.append("price", String(productInfo.price));
      formData.append("category", productInfo.category);

      // Append only non-null images under the key "images"
      (Object.values(images) as (File | null)[]).forEach((file) => {
        if (file) formData.append("images", file);
      });

      const response = await fetch("/api/store/product", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add product");
      }

      toast.success(data.message, { id: loadingToastId });

      // Reset form
      setProductInfo({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
      });
      setImages({ 1: null, 2: null, 3: null, 4: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message, { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="text-slate-500 dark:text-slate-400 mb-28"
    >
      <h1 className="text-2xl">
        Add New{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Products
        </span>
      </h1>
      <p className="mt-7">Product Images</p>

      <div className="flex gap-3 mt-4">
        {(Object.keys(images) as ImageSlotKey[]).map((key) => (
          <label key={key} htmlFor={`images${key}`}>
            <Image
              width={300}
              height={300}
              className="h-15 w-auto border border-slate-200 dark:border-slate-700 rounded cursor-pointer"
              src={
                images[key]
                  ? URL.createObjectURL(images[key] as File)
                  : assets.upload_area
              }
              alt="product image"
            />
            <input
              type="file"
              accept="image/*"
              id={`images${key}`}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setImages((prev) => ({
                  ...prev,
                  [key]: e.target.files?.[0] ?? null,
                }))
              }
              hidden
            />
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-2 my-6 text-slate-700 dark:text-slate-300">
        Name
        <input
          type="text"
          name="name"
          onChange={onChangeHandler}
          value={productInfo.name}
          placeholder="Enter product name"
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          required
        />
      </label>

      <label className="flex flex-col gap-2 my-6 text-slate-700 dark:text-slate-300">
        Description
        <textarea
          name="description"
          onChange={onChangeHandler}
          value={productInfo.description}
          placeholder="Enter product description"
          rows={5}
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 dark:border-slate-700 rounded resize-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          required
        />
      </label>

      <div className="flex gap-5">
        <label className="flex flex-col gap-2 text-slate-700 dark:text-slate-300">
          Actual Price ($)
          <input
            type="number"
            name="mrp"
            onChange={onChangeHandler}
            value={productInfo.mrp}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 dark:border-slate-700 rounded resize-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-slate-700 dark:text-slate-300">
          Offer Price ($)
          <input
            type="number"
            name="price"
            onChange={onChangeHandler}
            value={productInfo.price}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 dark:border-slate-700 rounded resize-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
          />
        </label>
      </div>

      <select
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setProductInfo((prev) => ({ ...prev, category: e.target.value }))
        }
        value={productInfo.category}
        className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
        required
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <br />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-slate-800 dark:bg-slate-700 text-white px-6 mt-7 py-2 hover:bg-slate-900 dark:hover:bg-slate-600 rounded transition disabled:opacity-50"
      >
        Add Product
      </button>
    </form>
  );
}
