import PostListHeader from "@/app/(root)/(explorar)/anuncios/components/PostListHeader";
import MasonryPostGrid from "@/components/grids/MasonryPostGrid";
import PostsGrid from "@/components/grids/PostGrid";
import PostGridList from "@/components/grids/PostGridList";
import { Post } from "@/types/postTypes";
import { useFilteredAndSortedPosts } from "@/utils/hooks/useFilteredOrderedPosts";
import { useState } from "react";

const UserPosts = ({ posts }: { posts: Post[] }) => {
  const {
    searchTerms,
    setSearchTerms,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
  } = useFilteredAndSortedPosts(posts);
  return (
    <>
      <PostListHeader
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        filter={filter}
        setFilter={setFilter}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        showToggleList={false}
      />
      <MasonryPostGrid posts={sortedItems} isGroupPost={false} />
    </>
  );
};

export default UserPosts;
