import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchDataByType } from "../data/fetchDataByType";
import { toastifyError } from "../functions/toastify";

// Custom hook for infinite scroll and data fetching
export const useInfiniteFetch = (
  postType: "good" | "service" | "petition" | "groups" | "users" | "boards" | "groupPosts",
  groupId?: string
) => {
  // is loading
  const [isLoading, setIsLoading] = useState(false);
  // has more data to fetch (used for infinite scroll)
  const [hasMoreData, setHasMoreData] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  // Get search params in url
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");
  // Create fetchData function based on postType and searchTerm
  const fetchData = useMemo(() => {
    return fetchDataByType(postType, busqueda, groupId);
  }, [postType, busqueda, groupId]);

  // Function to handle initial fetch and scroll-based fetch
  const loadMore = useCallback(async () => {
    // Check if data is still loading or there are no more items
    if (isLoading || !hasMoreData) return;

    setIsLoading(true);
    try {
      const data: any = await fetchData();
      if (data.error) {
        toastifyError((data as any).error);
      } else {
        setHasMoreData(data.hasMore)
        setItems((prevItems) => [...prevItems, ...data.items]);
      }
    } catch (error: any) {
      // Handle error here if needed
      toastifyError(error as string);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMoreData, fetchData]);

  // Fetch data on initial render and when postType changes
  useEffect(() => {
    setItems([]); // Clear items when postType changes
    loadMore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType, busqueda]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const bottomReached =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200;

    if (bottomReached) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return { items, isLoading };
};
