import React from "react";
import { Good } from "@/types/postTypes";
import PostCardBody from "./PostCardBody";
import PostImage from "./PostImage";


const GoodCard = ({
  post,
  recommendation,
  savePostMagazine,
  isGroupPost
}: {
  post: Good;
  recommendation: boolean;
    savePostMagazine: boolean;
  isGroupPost: boolean;
}) => {
  const { title, reviews, description, price } = post;
  return (
    <>
      <PostImage post={post} recommendation={recommendation} savePostMagazine={savePostMagazine}/>
      <PostCardBody
        title={title}
        reviews={reviews}
        description={description}
        price={price}
        isGroupPost={isGroupPost}
        isService={false}
      />
    </>
  );
};

export default GoodCard;
