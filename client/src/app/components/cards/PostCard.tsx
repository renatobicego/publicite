import { Good, Post, Service } from "@/types/postTypes";
import GoodCard from "./GoodCard";
import ServiceCard from "./ServiceCard";
const PostCard = ({
  postData,
  recommendation,
}: {
  postData: Post;
  recommendation: boolean;
}) => {
  const { postType } = postData;
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

export default PostCard;
