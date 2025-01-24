import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import { PostComment } from "@/types/postTypes";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { FaReply } from "react-icons/fa6";
import DeleteComment from "./DeleteComment";

const ReplyCard = ({
  reply,
  isAuthor,
}: {
  reply: PostComment;
  isAuthor: boolean;
  }) => {
  return (
    <Card shadow="sm" className="w-11/12 md:w-5/6 xl:w-3/4 px-2.5 py-2">
      <CardHeader className="flex w-full justify-between pb-0">
        <div className="flex gap-2 items-center">
          <FaReply className="size-4 text-light-text" />
          <UsernameAvatar author={reply.user} showAvatar={false} />
        </div>
        <p className="text-light-text text-xs xl:text-sm">
          {reply.createdAt && showDate(parseIsoDate(reply.createdAt))}
        </p>
      </CardHeader>
      <CardBody className="flex justify-between gap-1 flex-row">
        <p className="text-xs md:text-sm xl:text-base">{reply.comment}</p>
        {isAuthor && <DeleteComment commentId={reply._id} isReply />}
      </CardBody>
    </Card>
  );
};

export default ReplyCard;
