"use client";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { deleteCommentById } from "@/services/postsServices";
import { PostComment } from "@/types/postTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { IoTrashOutline } from "react-icons/io5";

const DeleteComment = ({
  commentId,
  isReply = false,
  isAuthorOfPost,
  setComments,
}: {
  commentId: ObjectId;
  isReply?: boolean;
  isAuthorOfPost: boolean;
  setComments: Dispatch<SetStateAction<PostComment[]>>;
}) => {
  const handleSubmit = async () => {
    const res = await deleteCommentById(commentId, isAuthorOfPost);
    if ("error" in res) {
      toastifyError(res.error);
      return;
    }
    toastifySuccess(res.message as string);
    if (isReply) {
      setComments((prev) =>
        prev.filter((c) => {
          if (c.response?._id === commentId) return false;
          return true;
        })
      );
      return;
    }
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };
  return (
    <ConfirmModal
      message="¿Está seguro de eliminar este comentario?"
      ButtonAction={
        <Button
          radius="full"
          variant="light"
          isIconOnly
          aria-label="Eliminar comentario"
          size="sm"
          color="danger"
        >
          <IoTrashOutline className="size-4" />
        </Button>
      }
      confirmText="Eliminar"
      onConfirm={handleSubmit}
      tooltipMessage="Eliminar comentario"
    />
  );
};

export default DeleteComment;
