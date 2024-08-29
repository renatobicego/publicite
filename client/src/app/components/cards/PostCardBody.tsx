import { PostReview } from "@/types/postTypes";
import { CardBody } from "@nextui-org/react";
import React from "react";
import { FaStar } from "react-icons/fa6";
import ServiceChip from "../chips/ServiceChip";

interface PostCardBodyProps {
  title: string;
  reviews: PostReview[];
  description?: string;
  price: number;
  isService: boolean;
}

const PostCardBody = ({
  title,
  reviews,
  description,
  price,
  isService,
}: PostCardBodyProps) => {
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  return (
    <CardBody className="pt-0 flex flex-col gap-1 max-md:px-1 md:px-2 lg:px-3">
      <div className="flex gap-1 w-full justify-between items-start">
        <h6>{title}</h6>
        {reviews.length > 0 && (
          <div className="flex gap-1 items-center text-light-text text-sm">
            <FaStar className="size-3 md:size-4"/>
            <span>{averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
      {isService && <ServiceChip />}
      <p className="text-light-text line-clamp-2 max-md:text-xs">{description}</p>
      <h6 className="text-light-text max-md:text-xs">${price}</h6>
    </CardBody>
  );
};

export default PostCardBody;
