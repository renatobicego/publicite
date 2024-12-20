import { Good, Petition, Post, Service } from "@/types/postTypes";
import GoodCard from "./GoodCard";
import ServiceCard from "./ServiceCard";
import { Card, CardFooter } from "@nextui-org/react";
import PetitionCard from "../PetitionCard";
import UsernameAvatar from "@/components/buttons/UsernameAvatar";
const PostCard = ({
  postData,
  recommendation = false,
  className,
  savePostMagazine = false,
  isGroupPost = false,
}: {
  postData: Post;
  recommendation?: boolean;
  className?: string;
  savePostMagazine?: boolean;
  isGroupPost?: boolean;
}) => {
  const { postType } = postData;
  const PostCardToReturn = () => {
    switch (postType) {
      case "good":
        return (
          <GoodCard
            post={postData as Good}
            isGroupPost={isGroupPost}
            recommendation={recommendation}
            savePostMagazine={savePostMagazine}
          />
        );
      case "service":
        return (
          <ServiceCard
            post={postData as Service}
            isGroupPost={isGroupPost}
            recommendation={recommendation}
            savePostMagazine={savePostMagazine}
          />
        );
      case "petition":
        return (
          <PetitionCard
            isGroupPost={isGroupPost}
            post={postData as Petition}
            recommendation={recommendation}
          />
        );
      default:
        throw new Error("Invalid post type");
    }
  };

  return (
    <Card
      className={`w-full ease-in-out hover:shadow md:hover:shadow-md gap-4 
        !transition-shadow duration-500 !opacity-100 ${
          isGroupPost ? "self-start" : ""
        }
        ${
          postType === "petition" ? "border border-petition" : ""
        } ${className}`}
      shadow="none"
    >
      {PostCardToReturn()}
      {isGroupPost && (
        <CardFooter className="-mt-4">
          <UsernameAvatar author={postData.author} showAvatar />
        </CardFooter>
      )}
    </Card>
  );
};

export default PostCard;
