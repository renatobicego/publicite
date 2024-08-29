import { Card, CardBody, CardHeader, Link } from "@nextui-org/react";
import React from "react";
import PostImage from "./PostImage";
import { Good } from "@/types/postTypes";
import { FaStar } from "react-icons/fa6";
import SaveButton from "../buttons/SaveButton";
import PostCardBody from "./PostCardBody";
import { POSTS } from "@/types/urls";

const GoodCard = ({
  post,
  recommendation,
}: {
  post: Good;
  recommendation: boolean;
}) => {
  const { _id, imagesUrls, title, reviews, description, price } = post;
  return (
    <Card
      className="w-full ease-in-out hover:shadow-md gap-4 !transition-shadow duration-500 hover:cursor-pointer !opacity-100"
      shadow="none"
      
    >
      <PostImage _id={_id} url={imagesUrls[0]} title={title} />
      <PostCardBody
        title={title}
        reviews={reviews}
        description={description}
        price={price}
        isService={false}
      />
    </Card>
  );
};

export default GoodCard;
