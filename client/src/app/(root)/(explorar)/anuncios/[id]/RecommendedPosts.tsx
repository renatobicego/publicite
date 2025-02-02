import PostsGrid from "@/components/grids/PostGrid";
import { Post } from "@/types/postTypes";

const RecommendedPosts = ({
  recommendedPosts,
}: {
  recommendedPosts: Post[];
}) => {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <h4>Anuncios Relacionados</h4>
      <PostsGrid posts={recommendedPosts} recommendation />
    </div>
  );
};

export default RecommendedPosts;
