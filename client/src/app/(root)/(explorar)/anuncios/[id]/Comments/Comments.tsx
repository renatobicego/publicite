import { PostComment, PostDataNotification } from "@/types/postTypes";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";

const Comments = async ({
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
  return (
    <div className="flex flex-col flex-1 w-full lg:max-w-[50%] gap-4">
      <h4>Comentarios</h4>
      <CommentForm post={post} userIdTo={authorId} />
      {comments.map((comment) => (
        <CommentCard
          key={comment._id}
          comment={comment}
          isAuthor={isAuthor}
          post={post}
        />
      ))}
    </div>
  );
};

export default Comments;
