"use client";
import { PostComment, PostDataNotification } from "@/types/postTypes";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import { useState } from "react";

const Comments = ({
  comments,
  post,
  isAuthor,
  authorId,
}: {
  comments: PostComment[];
  post: PostDataNotification & { author: string };
  isAuthor: boolean;
  authorId: ObjectId;
}) => {
  const [commentsLocal, setCommentsLocal] = useState(comments);
  return (
    <div className="flex flex-col flex-1 w-full lg:max-w-[50%] gap-4">
      <h4>Comentarios</h4>
      <CommentForm
        key={"commentform" + post._id}
        post={post}
        userIdTo={authorId}
        setComments={setCommentsLocal}
      />
      {commentsLocal.map((comment) => (
        <CommentCard
          key={comment._id}
          comment={comment}
          isAuthor={isAuthor}
          post={post}
          setComments={setCommentsLocal}
        />
      ))}
    </div>
  );
};

export default Comments;
