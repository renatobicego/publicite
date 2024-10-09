import { useState } from "react";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaRegStar, FaStar } from "react-icons/fa6";

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  // Handle click event to set rating
  const handleClick = (newValue: number) => {
    if (value === newValue) {
      onChange(newValue - 0.5);
      return;
    }
    onChange(newValue);
  };

  // Render stars
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFullStar = value >= i;
      const isHalfStar = value === i - 0.5;

      stars.push(
        <span key={i} className="cursor-pointer" onClick={() => handleClick(i)}>
          {/* Full star */}
          {isFullStar ? (
            <FaStar className="w-6 h-6 text-primary" />
          ) : isHalfStar ? (
            <FaStarHalfAlt className="w-6 h-6 text-primary" />
          ) : (
            <FaRegStar className="w-6 h-6 text-gray-300" />
          )}
        </span>
      );
    }
    return stars;
  };

  return <div className="flex gap-1">{renderStars()}</div>;
};

export default StarRating;
