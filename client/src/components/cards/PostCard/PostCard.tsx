import { Good, Petition, Post, Service } from "@/types/postTypes";
import GoodCard from "./GoodCard";
import ServiceCard from "./ServiceCard";
import { Card } from "@nextui-org/react";
import PetitionCard from "../PetitionCard";
const PostCard = ({
  postData,
  recommendation,
  className,
  savePostMagazine = false,
}: {
  postData: Post;
  recommendation: boolean;
  className?: string;
  savePostMagazine?: boolean;
}) => {
  const { postType } = postData;
  const PostCardToReturn = () => {
    switch (postType) {
      case "good":
        return (
          <GoodCard
            post={postData as Good}
            recommendation={recommendation}
            savePostMagazine={savePostMagazine}
          />
        );
      case "service":
        return (
          <ServiceCard
            post={postData as Service}
            recommendation={recommendation}
            savePostMagazine={savePostMagazine}
          />
        );
      case "petition":
        return (
          <PetitionCard
            post={postData as Petition}
            recommendation={recommendation}
          />
        );
      default:
        break;
    }
  };

  return (
    <Card
      className={`w-full ease-in-out hover:shadow md:hover:shadow-md gap-4 
        !transition-shadow duration-500 !opacity-100
        ${
          postType === "petition" ? "border border-petition" : ""
        } ${className}`}
      shadow="none"
    >
      {PostCardToReturn()}
    </Card>
  );
};

export default PostCard;
