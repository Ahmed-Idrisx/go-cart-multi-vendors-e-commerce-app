"use client";

import { useState } from "react";
import { Star, XIcon } from "lucide-react";
import toast from "react-hot-toast";

interface RatingModalProps {
  ratingModal: {
    productId: string;
    orderId: string;
  };
  setRatingModal: React.Dispatch<
    React.SetStateAction<{
      orderId: string;
      productId: string;
    } | null>
  >;
}

export default function RatingModal({
  ratingModal,
  setRatingModal,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = async () => {
    if (rating <= 0 || rating > 5) {
      toast("Please select a rating");
    }
    if (review.length < 5) {
      toast("Write a review of at least 5 characters");
    }
    setRatingModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-96 relative border border-gray-150 dark:border-slate-700">
        <button
          onClick={() => setRatingModal(null)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <XIcon size={20} />
        </button>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Rate Product
        </h2>
        <div className="flex items-center justify-center mb-6 gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`size-8 cursor-pointer transition-all ${
                rating > i
                  ? "text-green-500 fill-current scale-110"
                  : "text-gray-300 dark:text-slate-650"
              }`}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
        <textarea
          className="resize-none w-full p-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Write your review"
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <button
          onClick={() =>
            toast.promise(handleSubmit(), {
              loading: "Submitting...",
            })
          }
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition shadow-md"
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}
