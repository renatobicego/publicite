import PostsGrid from "@/app/components/grids/PostGrid";
import PostGridList from "@/app/components/grids/PostGridList";
import { useInfiniteFetch } from "@/app/utils/hooks/useInfiniteFetch";
import { useState } from "react";
import PostListHeader from "./PostListHeader";
import { useFilteredAndSortedPosts } from "@/app/utils/hooks/useFilteredOrderedPosts";

const PostListLogic = ({postType} : {postType: "good" | "service" | "petition"}) => {
  const [showAsList, setShowAsList] = useState(false);
  const { items, isLoading } = useInfiniteFetch(postType, true);
  const {
    searchTerm,
    setSearchTerm,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
  } = useFilteredAndSortedPosts(items);
  return (
    <>
      <PostListHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        showAsList={showAsList}
        setShowAsList={setShowAsList}
      />
      {showAsList ? (
        <PostGridList items={sortedItems} isLoading={isLoading} />
      ) : (
        <PostsGrid posts={sortedItems} isLoading={isLoading} />
      )}
    </>
  );
};

export default PostListLogic;
