import { PostComment } from "@/types/postTypes";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";

const Comments = async ({
  comments,
  postId,
  isAuthor
}: {
  comments: PostComment[];
  postId: ObjectId;
  isAuthor: boolean
}) => {
  return (
    <div className="flex flex-col flex-1 w-full lg:max-w-[50%] gap-4">
      <h4>Comentarios</h4>
      <CommentForm postId={postId} />
      {comments.map((comment) => (
        <CommentCard key={comment._id} comment={comment} isAuthor={isAuthor}/>
      ))}
    </div>
  );
};

export default Comments;
