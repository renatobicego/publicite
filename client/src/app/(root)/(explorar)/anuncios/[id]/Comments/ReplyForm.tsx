"use client";
import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { PostComment, PostDataNotification, Reviewer } from "@/types/postTypes";
import { Button, CardFooter } from "@nextui-org/react";
import { lazy, useState } from "react";
import { FaComment, FaX } from "react-icons/fa6";
const CommentForm = lazy(() => import("./CommentForm"));
import DeleteComment from "./DeleteComment";

const ReplyForm = ({
  comment,
  isAuthor,
  post,
}: {
  comment: PostComment;
  isAuthor: boolean;
  post: PostDataNotification;
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <CardFooter className="flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center w-full">
        <UsernameAvatar author={comment.user} />
        <div className="flex gap-1 items-center">
          <Button
            variant="light"
            onClick={() => setShowForm(!showForm)}
            isIconOnly
            aria-label={showForm ? "Cerrar respuesta" : "Responder"}
            size="sm"
            radius="full"
            color={showForm ? "danger" : "secondary"}
          >
            {showForm ? (
              <FaX className="size-3" />
            ) : (
              <FaComment className="size-4" />
            )}
          </Button>
          {isAuthor && <DeleteComment commentId={comment._id} />}
        </div>
      </div>
      {showForm && (
        <CommentForm
          post={post}
          isReply
          closeForm={() => setShowForm(false)}
          userIdTo={(comment.user as Reviewer)._id}
        />
      )}
    </CardFooter>
  );
};

export default ReplyForm;
