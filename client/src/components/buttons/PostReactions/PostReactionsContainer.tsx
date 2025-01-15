import { Post } from "@/types/postTypes";
import ReactToPost from "./ReactToPost";
import PostReactions from "./PostReactions";

const PostReactionsContainer = ({
  post,
  isAuthor,
}: {
  post: Post;
  isAuthor: boolean;
}) => {
  const emojis = ["👍", "😊", "❤️", "😂", "😲"];
  // list of emojis to react
  return (
    <menu className="relative">
      {!isAuthor && <ReactToPost post={post} emojis={emojis} />}

      <PostReactions emojis={emojis} reactions={post.reactions} />
    </menu>
  );
};

export default PostReactionsContainer;
