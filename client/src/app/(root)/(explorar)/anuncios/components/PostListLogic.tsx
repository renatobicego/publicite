import PostsGrid from "@/components/grids/PostGrid";
import PostGridList from "@/components/grids/PostGridList";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import { useState } from "react";
import PostListHeader from "./PostListHeader";
import { useFilteredAndSortedPosts } from "@/utils/hooks/useFilteredOrderedPosts";

const PostListLogic = ({
  postType,
  groupId
}: {
  postType: "good" | "service" | "petition" | "groupPosts";
  groupId?: ObjectId
}) => {
  const [showAsList, setShowAsList] = useState(false);
  const { items, isLoading } = useInfiniteFetch(postType, groupId);
  const {
    searchTerms,
    setSearchTerms,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
  } = useFilteredAndSortedPosts(items);
  return (
    <>
      <PostListHeader
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
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
        <PostsGrid posts={sortedItems} isLoading={isLoading} isGroupPosts={postType === "groupPosts"} />
      )}
    </>
  );
};

export default PostListLogic;
