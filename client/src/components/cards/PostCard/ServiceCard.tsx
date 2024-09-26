import { Service } from "@/types/postTypes";
import { Card  } from "@nextui-org/react";
import PostImage from "./PostImage";
import PostCardBody from "./PostCardBody";

const ServiceCard = ({
  post,
  recommendation,
  savePostMagazine
}: {
  post: Service;
  recommendation: boolean;
  savePostMagazine: boolean;
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
        isService={true}
      />
    </>
  );
};

export default ServiceCard;
