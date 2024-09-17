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
    <section
      className={`grid grid-cols-2 gap-3 md:gap-4  ${
        !recommendation ? "md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5" : "md:max-lg:grid-cols-3"
      }  lg:gap-5 w-full`}
    >
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
