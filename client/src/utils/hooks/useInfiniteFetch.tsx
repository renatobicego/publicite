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

  // Function to handle initial fetch and scroll-based fetch
  const loadMore = useCallback(async () => {
    console.log("Loading more data...", busqueda, hasMoreData);
    if (isLoading || !hasMoreData || errorOccurred) return;
    setIsLoading(true);
    try {
      const data: any = await fetchDataByType(
        postType,
        busqueda,
        page,
        groupId
      );
      if (data.error) {
        toastifyError(data.error);
        setErrorOccurred(true);
      } else {
        setHasMoreData(data.hasMore);
        if (data.hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
        setItems((prevItems) => [...prevItems, ...data.items]);
        setErrorOccurred(false);
      }
    } catch (error: any) {
      toastifyError(error as string);
      setErrorOccurred(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    hasMoreData,
    errorOccurred,
    page,
    postType,
    busqueda,
    groupId,
  ]);

  // Trigger to reset state when postType or search term changes
  useEffect(() => {
    // Reset state when postType or searchParams change
    setItems([]); // Clear items first
    setPage(1); // Reset page number
    setErrorOccurred(false); // Reset error flag when postType or search params change

    // Set `hasMoreData` to true first
    setHasMoreData(true);
  }, [postType, busqueda]);

  // Effect to call `loadMore` only after `hasMoreData` is set to true
  useEffect(() => {
    // Check if `hasMoreData` is true, and if so, call `loadMore`
    if (hasMoreData && !isLoading && !errorOccurred && page === 1) {
      loadMore();
    }
  }, [hasMoreData, isLoading, errorOccurred, page, loadMore]);

  // Handle scroll event

  // Handle scroll and call loadMore when reaching the bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - window.innerHeight * 0.3;

      if (bottomReached && !isLoading && hasMoreData && !errorOccurred) {
        loadMore(); // Will call the updated loadMore function
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore, isLoading, hasMoreData, errorOccurred]);
  return { items, isLoading };
};
