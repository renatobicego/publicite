import { Service } from "@/types/postTypes";
import { Card  } from "@nextui-org/react";
import PostImage from "./PostImage";
import PostCardBody from "./PostCardBody";

const ServiceCard = ({
  post,
  recommendation,
}: {
  post: Service;
  recommendation: boolean;
}) => {
  const { title, reviews, description, price } = post;

  return (
    <Card
      className="w-full ease-in-out hover:shadow-md gap-4 !transition-shadow duration-500 hover:cursor-pointer"
      shadow="none"
    >
      <PostImage post={post} recommendation={recommendation} />
      <PostCardBody
        title={title}
        reviews={reviews}
        description={description}
        price={price}
        isService={true}
      />
    </Card>
  );
};

export default ServiceCard;
