"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/axios";
import StarRating from "@/components/ui/StarRating";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────────
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

interface RatingDist {
  rating: number;
  count: number;
}

interface ReviewSectionProps {
  productId: string;
  avgRating: number;
  reviewCount: number;
  reviews: Review[];
  ratingDistribution?: RatingDist[];
}

// ── Rating Bar ─────────────────────────────────────────────────
function RatingBar({ dist, total }: { dist: RatingDist; total: number }) {
  const pct = total > 0 ? Math.round((dist.count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-4">{dist.rating}</span>
      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="text-xs text-gray-400 w-6">{dist.count}</span>
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-gray-100 pb-5 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {review.user.avatar ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold shrink-0"
              aria-hidden="true"
            >
              {review.user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.user.name}</p>
            <StarRating rating={review.rating} size="xs" />
          </div>
        </div>
        <time
          className="text-xs text-gray-400"
          dateTime={review.createdAt}
        >
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed ml-12">{review.comment}</p>
    </article>
  );
}

// ── Review Form ────────────────────────────────────────────────
function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: (review: Review) => void;
}) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (comment.trim().length < 3) {
      toast.error("Comment must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/reviews/${productId}`, { rating, comment });
      onSuccess(res.data.data.review);
      setRating(0);
      setComment("");
      toast.success("Review submitted!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5" noValidate>
      <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>

      {/* Star Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
        <div className="flex gap-1" role="group" aria-label="Select rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={rating >= star}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <svg
                className="w-7 h-7 transition-colors"
                fill={(hovered || rating) >= star ? "#f59e0b" : "#d1d5db"}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Share your experience with this product..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all resize-none bg-white"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function ReviewSection({
  productId,
  avgRating,
  reviewCount,
  reviews: initialReviews,
  ratingDistribution = [],
}: ReviewSectionProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-black text-gray-900 mb-6">
        Customer Reviews
        <span className="text-base font-normal text-gray-400 ml-2">({reviewCount})</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Rating Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-6xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
          <StarRating rating={avgRating} size="md" />
          <p className="text-sm text-gray-500 mt-2">{reviewCount} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
          {ratingDistribution.length > 0 ? (
            ratingDistribution.map((dist) => (
              <RatingBar key={dist.rating} dist={dist} total={reviewCount} />
            ))
          ) : (
            [5, 4, 3, 2, 1].map((r) => (
              <RatingBar key={r} dist={{ rating: r, count: 0 }} total={0} />
            ))
          )}
        </div>

        {/* Write Review */}
        {user ? (
          <ReviewForm productId={productId} onSuccess={handleNewReview} />
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center text-center">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Have this product?</p>
              <p className="text-gray-400 text-sm">Login to share your review</p>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 font-semibold">No reviews yet</p>
          <p className="text-gray-300 text-sm mt-1">Be the first to review this product</p>
        </div>
      )}
    </section>
  );
}