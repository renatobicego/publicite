import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchDataByType } from "../data/fetchDataByType";
import { toastifyError } from "../functions/toastify";

// Custom hook for infinite scroll and data fetching
export const useInfiniteFetch = (
  postType:
    | "good"
    | "service"
    | "petition"
    | "groups"
    | "users"
    | "boards"
    | "groupPosts",
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
        setHasMoreData(data.hasMore);
        setItems((prevItems) => [...prevItems, ...data.items]);
      }
    } catch (error: any) {
      toastifyError(error as string);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMoreData, fetchData]);
  // Trigger to reset state when postType or search term changes
  useEffect(() => {
    // Reset state when postType or searchParams change
    setItems([]); // Clear items first
    setHasMoreData(true); // Reset to allow API fetching
    setIsLoading(false); // Reset loading state if needed
  }, [postType, busqueda]);

  // This useEffect is triggered only after `hasMoreData` is set to `true`
  useEffect(() => {
    // After state has been reset, make sure to call `loadMore`
    if (hasMoreData) {
      loadMore();
    }
  }, [hasMoreData, loadMore]); // Only run loadMore when hasMoreData is reset to true

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
