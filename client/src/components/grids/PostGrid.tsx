import { Post } from "@/types/postTypes";
import PostCard from "../cards/PostCard/PostCard";
import { Spinner } from "@nextui-org/react";

const PostsGrid = ({
  posts,
  recommendation = false,
  isLoading = false,
  isGroupPosts = false,
}: {
  posts: Post[];
  recommendation?: boolean;
  isLoading?: boolean;
  isGroupPosts?: boolean;
}) => {
  return (
    <>
      <section
        className={`grid grid-cols-2 gap-3 md:gap-4  ${
          !recommendation
            ? "md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
            : "md:max-lg:grid-cols-3"
        }  lg:gap-5 w-full`}
      >
        {posts.map((post, index) => (
          <PostCard
            key={post._id + index}
            postData={post}
            recommendation={recommendation}
            isGroupPost={isGroupPosts}
          />
        ))}
      </section>
      {!isLoading && posts.length === 0 && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron anuncios para mostrar
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default PostsGrid;
