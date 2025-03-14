"use client";
import { Post } from "@/types/postTypes";
import ReactToPost from "./ReactToPost";
import PostReactions from "./PostReactions";
import { useState } from "react";

const PostReactionsContainer = ({
  post,
  isAuthor,
}: {
  post: Post;
  isAuthor: boolean;
}) => {
  const [localReactions, setLocalReactions] = useState(post.reactions);
  const emojis = ["👍", "😊", "❤️", "😂", "😲"];
  // list of emojis to react
  return (
    <menu className="relative">
      {!isAuthor && (
        <ReactToPost
          post={{
            _id: post._id,
            author: post.author,
            postType: post.postType,
            title: post.title,
            imagesUrls:
              "imagesUrls" in post && post.imagesUrls
                ? (post.imagesUrls as string[])
                : undefined,
          }}
          reactions={localReactions}
          emojis={emojis}
          setLocalReactions={setLocalReactions}
        />
      )}

      <PostReactions emojis={emojis} reactions={localReactions} />
    </menu>
  );
};

export default PostReactionsContainer;
