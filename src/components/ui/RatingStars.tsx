import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  reviewCount,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = i === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                filled || partial ? "star-filled" : "star-empty"
              )}
              fill={filled ? "currentColor" : partial ? "url(#partial)" : "none"}
            />
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-medium text-foreground", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn("text-muted-foreground", textSizes[size])}>
          ({reviewCount} reviews)
        </span>
      )}
    </div>
  );
}
