"use client";
import { PostComment, PostDataNotification } from "@/types/postTypes";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import SecondaryButton from "@/components/buttons/SecondaryButton";

const Comments = ({
  comments,
  post,
  isAuthor,
  authorId,
}: {
  comments: PostComment[];
  post: PostDataNotification;
  isAuthor: boolean;
  authorId: ObjectId;
}) => {
  const [commentsLocal, setCommentsLocal] = useState(comments);
  return (
    <div
      id="comentarios"
      className="flex flex-col flex-1 w-full lg:max-w-[50%] gap-4"
    >
      <h4>Comentarios</h4>
      <SignedIn>
        <CommentForm
          key={"commentform" + post._id}
          post={{
            ...post,
            authorId,
          }}
          userIdTo={authorId}
          setComments={setCommentsLocal}
        />
      </SignedIn>
      <SignedOut>
        <SignInButton fallbackRedirectUrl={`/anuncios/${post._id}`}>
          <SecondaryButton className="self-start">
            Inicia Sesión para Comentar
          </SecondaryButton>
        </SignInButton>
      </SignedOut>
      {commentsLocal.map((comment) => (
        <CommentCard
          key={comment._id}
          comment={comment}
          isAuthor={isAuthor}
          post={{
            ...post,
            authorId,
          }}
          setComments={setCommentsLocal}
        />
      ))}
    </div>
  );
};

export default Comments;
