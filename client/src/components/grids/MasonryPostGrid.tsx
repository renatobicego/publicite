import { Post } from "@/types/postTypes";
import useMasonryGrid from "@/utils/hooks/useMasonryGrid";
import PostCard from "../cards/PostCard/PostCard";

const MasonryPostGrid = ({
  posts,
  isGroupPost,
  showChangeExpirationDate,
  showEmptyMessage,
  hideSaveMagazineButton,
}: {
  posts: Post[];
  isGroupPost: boolean;
  showChangeExpirationDate?: boolean;
  showEmptyMessage?: boolean;
  hideSaveMagazineButton?: boolean;
}) => {
  const { columns } = useMasonryGrid(posts, [2, 3, 4, 5], [768, 1280, 1720]);
  if (!posts || posts.length === 0)
    return showEmptyMessage ? (
      <p className="max-md:text-sm text-light-text ">
        El usuario no ha publicado anuncios.
      </p>
    ) : null;
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 items-start w-full">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="grid gap-4">
          {column.map((post: Post, index) => (
            <PostCard
              key={post._id + index}
              postData={post}
              className={post.postType === "petition" ? "mt-3" : ""}
              isGroupPost={isGroupPost}
              showChangeExpirationDate={showChangeExpirationDate}
              hideSaveMagazineButton={hideSaveMagazineButton}
            />
          ))}
        </div>
      ))}
    </section>
  );
};

export default MasonryPostGrid;
