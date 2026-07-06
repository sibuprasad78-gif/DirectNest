"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Review = {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
};

type ReviewSectionProps = {
  propertyId: string;
};

export default function ReviewSection({ propertyId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const loadReviews = async () => {
    const q = query(
      collection(db, "reviews"),
      where("propertyId", "==", propertyId)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];

    setReviews(data);
  };

  useEffect(() => {
    loadReviews();
  }, [propertyId]);
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please login first to write a review.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write your review.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "reviews"), {
        propertyId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.email || "DirectNest User",
        rating,
        review: reviewText,
        createdAt: serverTimestamp(),
      });

      alert("Review submitted successfully!");

      setReviewText("");
      setRating(5);

      await loadReviews();
    } catch (error: any) {
      alert(error.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">⭐ Reviews & Ratings</h2>

      <form onSubmit={submitReview} className="space-y-4">
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
          <option value={4}>⭐⭐⭐⭐ (4)</option>
          <option value={3}>⭐⭐⭐ (3)</option>
          <option value={2}>⭐⭐ (2)</option>
          <option value={1}>⭐ (1)</option>
        </select>

        <textarea
          placeholder="Write your review..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 h-28"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <h3 className="font-bold">{item.userName}</h3>

              <p className="text-yellow-500">
                {"⭐".repeat(item.rating)}
              </p>

              <p className="text-gray-700 mt-2">
                {item.review}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}