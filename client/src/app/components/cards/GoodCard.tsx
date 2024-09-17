import React from "react";
import PostImage from "./PostImage";
import { Good } from "@/types/postTypes";

import PostCardBody from "./PostCardBody";

const GoodCard = ({
  post,
  recommendation,
}: {
  post: Good;
  recommendation: boolean;
}) => {
  const { title, reviews, description, price } = post;
  return (
    <>
      <PostImage post={post} recommendation={recommendation}/>
      <PostCardBody
        title={title}
        reviews={reviews}
        description={description}
        price={price}
        isService={false}
      />
    </>
  );
};

export default GoodCard;
