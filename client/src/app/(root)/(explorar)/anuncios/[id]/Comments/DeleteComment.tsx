"use client";
import { Button } from "@nextui-org/react";
import { FaTrash } from "react-icons/fa6";

const DeleteComment = ({
  commentId,
  isReply = false,
}: {
  commentId: ObjectId;
  isReply?: boolean;
}) => {
  return (
    <Button
      radius="full"
      variant="light"
      isIconOnly
      size="sm"
      color="danger"
      onPress={() => console.log(commentId)}
    >
      <FaTrash className="size-4" />
    </Button>
  );
};

export default DeleteComment;
