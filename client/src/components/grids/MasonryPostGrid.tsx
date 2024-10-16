import { Post } from "@/types/postTypes";
import useMasonryGrid from "@/utils/hooks/useMasonryGrid";
import PostCard from "../cards/PostCard/PostCard";

const MasonryPostGrid = ({ posts, isGroupPost }: { posts: Post[], isGroupPost: boolean }) => {
  const { columns } = useMasonryGrid(posts, [2, 3, 4, 5], [768, 1280, 1720]);
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 items-start w-full">
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="grid gap-4"
        >
          {column.map((post: Post, index) => (
            <PostCard
              key={post._id + index}
              postData={post}
              isGroupPost={isGroupPost}
            />
          ))}
        </div>
      ))}
    </section>
  );
};

export default MasonryPostGrid;
