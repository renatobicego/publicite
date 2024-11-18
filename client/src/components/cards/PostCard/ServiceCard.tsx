import { Service } from "@/types/postTypes";
import { Card } from "@nextui-org/react";
import PostImage from "./PostImage";
import PostCardBody from "./PostCardBody";
import { formatTotal } from "@/utils/functions/utils";
import { frequencyPriceItems } from "@/utils/data/selectData";

const ServiceCard = ({
  post,
  recommendation,
  savePostMagazine,
  isGroupPost,
}: {
  post: Service;
  recommendation: boolean;
  savePostMagazine: boolean;
  isGroupPost: boolean;
}) => {
  const { title, reviews, description, price, frequencyPrice } = post;
  const frequencyShown = frequencyPrice
    ? `por ${
        frequencyPriceItems.find((item) => item.value === post.frequencyPrice)
          ?.text
      }`
    : "";
  return (
    <>
      <PostImage
        post={post}
        recommendation={recommendation}
        savePostMagazine={savePostMagazine}
      />
      <PostCardBody
        title={title}
        reviews={reviews}
        isGroupPost={isGroupPost}
        description={description}
        price={`${formatTotal(price)} ${frequencyShown}`}
        isService={true}
      />
    </>
  );
};

export default ServiceCard;
