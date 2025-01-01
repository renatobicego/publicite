import PostsGrid from "@/components/grids/PostGrid";
import PostGridList from "@/components/grids/PostGridList";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import { useState } from "react";
import PostListHeader from "./PostListHeader";
import { useFilteredAndSortedPosts } from "@/utils/hooks/useFilteredOrderedPosts";
import { useSearchParams } from "next/navigation";
import { PostsDataTypes } from "@/utils/data/fetchDataByType";

const PostListLogic = ({
  postType,
}: {
  postType: PostsDataTypes;
}) => {
  const [showAsList, setShowAsList] = useState(false);
  const { items, isLoading } = useInfiniteFetch(postType);
  const queryParams = useSearchParams();
  const querySearch = queryParams.get("busqueda") || ""
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
        <PostGridList
          items={sortedItems}
          isLoading={isLoading}
          isSearchDone={querySearch.length > 0}
        />
      ) : (
        <PostsGrid
          posts={sortedItems}
          isLoading={isLoading}
          isGroupPosts={postType.typeOfData === "groupPosts"}
          isSearchDone={querySearch.length > 0}
        />
      )}
    </>
  );
};

export default PostListLogic;
