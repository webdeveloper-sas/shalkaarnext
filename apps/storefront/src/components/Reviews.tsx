"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful?: number;
  verified?: boolean;
}

interface ReviewsProps {
  productId: string;
  onReviewAdded?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";

export default function Reviews({ productId, onReviewAdded }: ReviewsProps) {
  const { user, token, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);

        // Calculate average rating
        if (data.reviews && data.reviews.length > 0) {
          const avg =
            data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
            data.reviews.length;
          setAverageRating(avg);

          // Calculate rating distribution
          const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          data.reviews.forEach((r: Review) => {
            distribution[r.rating]++;
          });
          setRatingDistribution(distribution);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isAuthenticated || !user || !token) {
      setFormError("Please log in to submit a review");
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      setFormError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      // Reset form
      setFormData({ rating: 5, title: "", comment: "" });
      setShowForm(false);

      // Reload reviews
      await loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Section */}
      {reviews.length > 0 && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-gray-600 text-sm">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {rating} ★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${
                          reviews.length > 0
                            ? ((ratingDistribution[rating] || 0) / reviews.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      <div className="mb-8">
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Write a Review
          </button>
        )}

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg space-y-4">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            {/* Rating Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-3xl transition-colors"
                  >
                    <span className={star <= formData.rating ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            {/* Comment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience with this product"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comment.length}/1000 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">by {review.userName}</span>
                  </div>
                </div>
                {review.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    ✓ Verified Purchase
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(review.createdAt).toLocaleDateString("en-IN")}</span>
                {review.helpful !== undefined && (
                  <span>{review.helpful} people found this helpful</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
