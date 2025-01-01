"use client";
import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { PostComment } from "@/types/postTypes";
import { Button, CardFooter } from "@nextui-org/react";
import { useState } from "react";
import { FaComment, FaX } from "react-icons/fa6";
import CommentForm from "./CommentForm";
import DeleteComment from "./DeleteComment";

const ReplyForm = ({
  comment,
  isAuthor,
}: {
  comment: PostComment;
  isAuthor: boolean;
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <CardFooter className="flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center w-full">
        <UsernameAvatar author={comment.author} />
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
          postId={comment._id}
          isReply
          closeForm={() => setShowForm(false)}
        />
      )}
    </CardFooter>
  );
};

export default ReplyForm;
