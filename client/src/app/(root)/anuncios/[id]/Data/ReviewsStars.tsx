import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { PostReview } from "@/types/postTypes";

export const renderStars = (average: number) => {
  const fullStars = Math.floor(average);
  const hasHalfStar = average - fullStars >= 0.5;
  const stars = [];

  // Push full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={i} className="text-petition" />);
  }

  // Push half star if applicable
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-petition" />);
  }

  // Push remaining empty stars to make up 5 stars total
  while (stars.length < 5) {
    stars.push(
      <FaRegStar key={`empty-${stars.length}`} className="text-petition" />
    );
  }

  return stars;
};
const ReviewsStars = ({ reviews }: { reviews: PostReview[] }) => {
  const average =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Function to render stars based on the average rating

  return (
    <div className="flex items-center">
      {renderStars(average)}
      <span className="ml-2 text-petition font-medium">{reviews.length} calificaciones</span>
    </div>
  );
};

export default ReviewsStars;
