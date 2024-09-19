import { PostReview } from "@/types/postTypes";
import ReviewsStars, { renderStars } from "../ReviewsStars";
import { showDate } from "@/app/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import { Card, CardBody, CardHeader } from "@nextui-org/react";

const Reviews = ({ reviews }: { reviews: PostReview[] }) => {
  return (
    <div className="flex gap-2 w-full overflow-x-auto p-4">
      {reviews.map((review, index) => (
        <Card shadow="sm" key={index} className="w-5/6 md:w-3/4 xl:w-3/5 shrink-0 bg-fondo px-2.5 py-2">
          <CardHeader className="flex w-full justify-between">
            <div className="flex items-center">
              {renderStars(review.rating)}
            </div>
            <span className="text-light-text text-sm">
              {showDate(parseDate(review.date))}
            </span>
          </CardHeader>
          <CardBody className="text-sm xl:text-base">{review.review}</CardBody>
        </Card>
      ))}
    </div>
  );
};

export default Reviews;
