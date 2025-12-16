import { PostReview } from "@/types/postTypes";
import { CardBody } from "@nextui-org/react";
import React from "react";
import { FaStar } from "react-icons/fa6";
import ServiceChip from "../../chips/ServiceChip";

interface PostCardBodyProps {
  title: string;
  reviews: PostReview[];
  description?: string;
  price: string;
  isService: boolean;
  isGroupPost: boolean;
}

const PostCardBody = ({
  title,
  reviews,
  description,
  price,
  isService,
  isGroupPost,
}: PostCardBodyProps) => {
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : null; // Set to null or a default value if no reviews

  return (
    <CardBody
      className={`pt-0 flex flex-col gap-1 max-md:px-1 md:px-2 lg:px-3 pb-6`}
    >
      <div className="flex gap-1 w-full justify-between items-start">
        <h6>{title}</h6>
        {reviews &&
          Array.isArray(reviews) &&
          reviews.length > 0 &&
          typeof averageRating === "number" && (
            <div className="flex gap-1 items-center text-light-text text-sm">
              <FaStar className="size-3 md:size-4" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
          )}
      </div>
      {isService && <ServiceChip />}
      <p className="text-light-text line-clamp-2 text-xs lg:text-small 2xl:text-sm ">
        {description}
      </p>
      <p className="text-light-text text-small lg:text-sm 2xl:text-base font-semibold">
        {price ? `$${price}` : "Consultar precio"}
      </p>
    </CardBody>
  );
};

export default PostCardBody;
