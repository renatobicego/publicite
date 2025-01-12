import { Good, Petition, Post, Service } from "@/types/postTypes";
import GoodCard from "./GoodCard";
import ServiceCard from "./ServiceCard";
import { Card, CardFooter } from "@nextui-org/react";
import PetitionCard from "../PetitionCard";
import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { showDate } from "@/utils/functions/dates";
import { parseDate, parseDateTime } from "@internationalized/date";
import RenewPost from "@/components/modals/RenewPost";
const PostCard = ({
  postData,
  recommendation = false,
  className,
  interactable = false,
  isGroupPost = false,
  showChangeExpirationDate,
}: {
  postData: Post;
  recommendation?: boolean;
  className?: string;
  interactable?: boolean;
  isGroupPost?: boolean;
  showChangeExpirationDate?: boolean;
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
            savePostMagazine={!interactable}
          />
        );
      case "service":
        return (
          <ServiceCard
            post={postData as Service}
            isGroupPost={isGroupPost}
            recommendation={recommendation}
            savePostMagazine={!interactable}
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
      {showChangeExpirationDate && (
        <CardFooter className="flex flex-col gap-2 items-start justify-between -mt-4">
          <RenewPost postTitle={postData.title} id={postData._id} />
          <p className="text-light-text text-xs lg:text-sm">
           Vencimiento: {showDate(parseDateTime(postData.endDate.replace("Z", "")))}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default PostCard;
