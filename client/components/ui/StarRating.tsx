interface StarRatingProps {
  rating: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

const SIZE_MAP = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export default function StarRating({
  rating,
  size = "md",
  showValue = false,
  count,
}: StarRatingProps) {
  const sz = SIZE_MAP[size];

  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half   = !filled && rating >= star - 0.5;

          return (
            <svg key={star} className={sz} viewBox="0 0 24 24" aria-hidden="true">
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${star}-${rating}`}>
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#d1d5db" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${star}-${rating})`}
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </>
              ) : (
                <path
                  fill={filled ? "#f59e0b" : "#d1d5db"}
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              )}
            </svg>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
      )}

      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </div>
  );
}