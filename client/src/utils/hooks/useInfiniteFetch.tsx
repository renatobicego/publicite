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
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  // Error flag to prevent repeated calls
  const [errorOccurred, setErrorOccurred] = useState(false);

  // Get search params in url
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");

  // Create fetchData function based on postType and searchTerm
  const fetchData = useMemo(() => {
    return fetchDataByType(postType, busqueda, page, groupId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType, busqueda]);

  // Function to handle initial fetch and scroll-based fetch
  const loadMore = useCallback(async () => {
    // Check if data is still loading, no more items, or an error occurred
    if (isLoading || !hasMoreData || errorOccurred) return;

    setIsLoading(true);
    try {
      const data: any = await fetchData();
      if (data.error) {
        toastifyError(data.error);
        setErrorOccurred(true); // Set error flag to true
      } else {
        setHasMoreData(data.hasMore);
        if (data.hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
        setItems((prevItems) => [...prevItems, ...data.items]);
        setErrorOccurred(false); // Reset error flag if the call is successful
      }
    } catch (error: any) {
      toastifyError(error as string);
      setErrorOccurred(true); // Set error flag to true if there's an exception
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMoreData, fetchData, errorOccurred]);

  // Trigger to reset state when postType or search term changes
  useEffect(() => {
    // Reset state when postType or searchParams change
    setItems([]); // Clear items first
    setHasMoreData(true); // Reset to allow API fetching
    setPage(1); // Reset page number
    setIsLoading(false); // Reset loading state if needed
    setErrorOccurred(false); // Reset error flag when postType or search params change
  }, [postType, busqueda]);

  // This useEffect is triggered only after `hasMoreData` is set to `true`
  useEffect(() => {
    // After state has been reset, make sure to call `loadMore`
    if (hasMoreData && !errorOccurred) {
      loadMore();
    }
  }, [hasMoreData, loadMore, errorOccurred]); // Only run loadMore when hasMoreData is true and no error occurred

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const bottomReached =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200;

    if (bottomReached && !errorOccurred) {
      loadMore();
    }
  }, [loadMore, errorOccurred]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return { items, isLoading };
};
