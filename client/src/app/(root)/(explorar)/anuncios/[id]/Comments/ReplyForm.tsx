"use client";
import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { PostComment, PostDataNotification, Reviewer } from "@/types/postTypes";
import { Button, CardFooter, Skeleton } from "@nextui-org/react";
import { Dispatch, lazy, SetStateAction, Suspense, useState } from "react";
import { FaComment, FaX } from "react-icons/fa6";
const CommentForm = lazy(() => import("./CommentForm"));
import DeleteComment from "./DeleteComment";
import { useUserData } from "@/app/(root)/providers/userDataProvider";

const ReplyForm = ({
  comment,
  isAuthor,
  post,
  setComments,
}: {
  comment: PostComment;
  isAuthor: boolean;
  post: PostDataNotification & { authorId: string };
  setComments: Dispatch<SetStateAction<PostComment[]>>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const { userIdLogged } = useUserData();
  const isAuthorOfComment =
    isAuthor || (comment.user as Reviewer)._id === userIdLogged;
  return (
    <CardFooter className="flex flex-col gap-2 mt-2">
      <div className="flex flex-row justify-between items-center w-full mb-2">
        <UsernameAvatar author={comment.user} />
        <div className="flex gap-1 items-center">
          {isAuthor && (
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
          )}
          {!showForm && isAuthorOfComment && (
            <DeleteComment
              commentId={comment._id}
              isAuthorOfPost={isAuthor}
              setComments={setComments}
            />
          )}
        </div>
      </div>
      {showForm && isAuthor && (
        <Suspense fallback={<Skeleton className="w-full h-40" />}>
          <CommentForm
            post={post}
            key={"replyform" + comment._id}
            commentToReplyId={comment._id}
            closeForm={() => setShowForm(false)}
            userIdTo={(comment.user as Reviewer)._id}
            setComments={setComments}
          />
        </Suspense>
      )}
    </CardFooter>
  );
};

export default ReplyForm;
