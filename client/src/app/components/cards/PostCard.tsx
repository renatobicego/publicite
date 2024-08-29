import { Good, Post, Service } from "@/types/postTypes";
import GoodCard from "./GoodCard";
import ServiceCard from "./ServiceCard";
import { Card } from "@nextui-org/react";
const PostCard = ({
  postData,
  recommendation,
}: {
  postData: Post;
  recommendation: boolean;
}) => {
  const { postType } = postData;
  const PostCardToReturn = () => {
    switch (postType) {
      case "Good":
        return (
          <GoodCard post={postData as Good} recommendation={recommendation} />
        );
      case "Service":
        return (
          <ServiceCard
            post={postData as Service}
            recommendation={recommendation}
          />
        );
      default:
        break;
    }
  };

  return (
    <Card
      className="w-full ease-in-out hover:shadow md:hover:shadow-md gap-4 !transition-shadow duration-500 hover:cursor-pointer !opacity-100"
      shadow="none"
    >
      {PostCardToReturn()}
    </Card>
  );
};

export default PostCard;
