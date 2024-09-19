import { Good, Petition, Post, Service } from "@/types/postTypes";
import GoodCard from "./GoodCard";
import ServiceCard from "./ServiceCard";
import { Card } from "@nextui-org/react";
import PetitionCard from "./PetitionCard";
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
      case "good":
        return (
          <GoodCard post={postData as Good} recommendation={recommendation} />
        );
      case "service":
        return (
          <ServiceCard
            post={postData as Service}
            recommendation={recommendation}
          />
        );
      case "petition":
        return (
          <PetitionCard post={postData as Petition} recommendation={recommendation} />
        )
      default:
        break;
    }
  };

  return (
    <Card
      className={`w-full ease-in-out hover:shadow md:hover:shadow-md gap-4 
        !transition-shadow duration-500 hover:cursor-pointer !opacity-100
        ${postType === "petition" ? "border border-petition" : ""}`}
      shadow="none"
    >
      {PostCardToReturn()}
    </Card>
  );
};

export default PostCard;
