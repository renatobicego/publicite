import { showDate } from "@/utils/functions/dates";
import { PostComment } from "@/types/postTypes";
import { parseDate } from "@internationalized/date";
import { Card, CardBody } from "@nextui-org/react";
import ReplyCard from "./ReplyCard";
import ReplyForm from "./ReplyForm";

const CommentCard = ({
  comment,
  isAuthor,
}: {
  comment: PostComment;
  isAuthor: boolean;
}) => {
  return (
    <div className="flex flex-col gap-2 items-end w-full">
      <Card shadow="sm" className="px-2.5 py-2">
        <CardBody className="flex flex-row justify-between w-full gap-2 items-start pb-0">
          <p className="text-xs md:text-sm xl:text-base">{comment.comment}</p>
          <p className="font-medium text-light-text text-xs xl:text-sm min-w-fit">
            {showDate(parseDate(comment.date))}
          </p>
        </CardBody>
        <ReplyForm comment={comment} isAuthor={isAuthor} />
      </Card>
      {comment.replies.map((reply) => (
        <ReplyCard key={reply._id} reply={reply} isAuthor={isAuthor} />
      ))}
    </div>
  );
};

export default CommentCard;
