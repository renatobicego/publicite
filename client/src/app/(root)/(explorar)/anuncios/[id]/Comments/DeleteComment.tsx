"use client";
import { Button } from "@nextui-org/react";
import { IoTrashOutline } from "react-icons/io5";

const DeleteComment = ({
  commentId,
  isReply = false,
}: {
  commentId: ObjectId;
  isReply?: boolean;
}) => {
  // TODO
  return (
    <Button
      radius="full"
      variant="light"
      isIconOnly
      aria-label="Eliminar comentario"
      size="sm"
      color="danger"
      onPress={() => console.log(commentId)}
    >
      <IoTrashOutline className="size-4" />
    </Button>
  );
};

export default DeleteComment;
