import { PostComment } from "@/types/postTypes";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";

const Comments = async ({
  comments,
  postId,
  isAuthor,
  loggedUserId,
}: {
  comments: PostComment[];
  postId: ObjectId;
  isAuthor: boolean;
  loggedUserId: ObjectId;
}) => {
  return (
    <div className="flex flex-col flex-1 w-full lg:max-w-[50%] gap-4">
      <h4>Comentarios</h4>
      <CommentForm postId={postId} loggedUserId={loggedUserId} />
      {comments.map((comment) => (
        <CommentCard
          key={comment._id}
          comment={comment}
          isAuthor={isAuthor}
          loggedUserId={loggedUserId}
        />
      ))}
    </div>
  );
};

export default Comments;
