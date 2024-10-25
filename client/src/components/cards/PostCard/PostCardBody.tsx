import { PostReview } from "@/types/postTypes";
import { CardBody } from "@nextui-org/react";
import React from "react";
import { FaStar } from "react-icons/fa6";
import ServiceChip from "../../chips/ServiceChip";

interface PostCardBodyProps {
  title: string;
  reviews: PostReview[];
  description?: string;
  price: number;
  isService: boolean;
  isGroupPost: boolean;
}

const PostCardBody = ({
  title,
  reviews,
  description,
  price,
  isService,
  isGroupPost
}: PostCardBodyProps) => {
  const averageRating = reviews &&
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  return (
    <CardBody className={`pt-0 flex flex-col gap-1 max-md:px-1 md:px-2 lg:px-3 ${isGroupPost && "pb-2"}`}>
      <div className="flex gap-1 w-full justify-between items-start">
        <h6>{title}</h6>
        {reviews && reviews.length > 0 && (
          <div className="flex gap-1 items-center text-light-text text-sm">
            <FaStar className="size-3 md:size-4"/>
            {averageRating && <span>{averageRating.toFixed(1)}</span>}
          </div>
        )}
      </div>
      {isService && <ServiceChip />}
      <p className="text-light-text line-clamp-2 text-xs lg:max-2xl:text-small 2xl:text-sm ">{description}</p>
      <p className="text-light-text text-xs lg:max-2xl:text-small 2xl:text-sm font-semibold">${price}</p>
      
    </CardBody>
  );
};

export default PostCardBody;
