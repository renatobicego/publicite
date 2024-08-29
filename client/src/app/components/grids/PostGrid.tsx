import { Post } from "@/types/postTypes";
import PostCard from "../cards/PostCard";

const PostsGrid = ({
  posts,
  recommendation,
}: {
  posts: Post[];
  recommendation: boolean;
}) => {
  return (
    <section className="grid xl:grid-cols-4 3xl:grid-cols-5 gap-5 w-full">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          postData={post}
          recommendation={recommendation}
        />
      ))}
    </section>
  );
};

export default PostsGrid;
