import { Post } from "@/types/postTypes";
import PostCard from "../cards/PostCard/PostCard";
import { Spinner } from "@nextui-org/react";
import MasonryPostGrid from "./MasonryPostGrid";

const PostsGrid = ({
  posts,
  recommendation = false,
  isLoading = false,
  isGroupPosts = false,
  isSearchDone = false,
  showAsMasonry = false,
}: {
  posts: Post[];
  recommendation?: boolean;
  isLoading?: boolean;
  isGroupPosts?: boolean;
  isSearchDone?: boolean;
  showAsMasonry?: boolean;
}) => {
  return (
    <>
      {isGroupPosts || showAsMasonry ? (
        <MasonryPostGrid
          posts={posts}
          isGroupPost={isGroupPosts}
          showEmptyMessage={false}
        />
      ) : (
        <section
          className={`grid grid-cols-2 gap-3 md:gap-4  ${
            !recommendation
              ? "md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
              : "md:max-lg:grid-cols-3 items-start"
          }  lg:gap-5 w-full`}
        >
          {posts.map((post, index) => (
            <PostCard
              key={post._id + index}
              postData={post}
              recommendation={recommendation}
            />
          ))}
        </section>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron anuncios para mostrar.{" "}
          {isSearchDone && "Por favor, intenta con otros términos de búsqueda."}
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default PostsGrid;
