import React from "react";
import { Good } from "@/types/postTypes";
import PostCardBody from "./PostCardBody";
import PostImage from "./PostImage";
import { formatTotal } from "@/utils/functions/utils";

const GoodCard = ({
  post,
  recommendation,
  savePostMagazine,
  isGroupPost,
  hideSaveMagazineButton,
}: {
  post: Good;
  recommendation: boolean;
  savePostMagazine: boolean;
  isGroupPost: boolean;
  hideSaveMagazineButton?: boolean;
}) => {
  const { title, reviews, description, price } = post;
  const displayPrice =
    price === 8613.1 ? "Negociable / a pactar" : formatTotal(price);
  return (
    <>
      <PostImage
        post={post}
        recommendation={recommendation}
        savePostMagazine={savePostMagazine}
        hideSaveMagazineButton={hideSaveMagazineButton}
      />
      <PostCardBody
        title={title}
        reviews={reviews}
        description={description}
        price={displayPrice}
        isGroupPost={isGroupPost}
        isService={false}
      />
    </>
  );
};

export default GoodCard;
