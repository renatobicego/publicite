import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchDataByType } from "../data/fetchDataByType";
import { toastifyError } from "../functions/toastify";

// Custom hook for infinite scroll and data fetching
export const useInfiniteFetch = (
  postType: "good" | "service" | "petition" | "groups" | "users" | "boards",
  hasMoreData: boolean
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");
  // Create fetchData function based on postType and searchTerm
  const fetchData = useMemo(() => {
    return fetchDataByType(postType, busqueda);
  }, [postType, busqueda]);

  // Function to handle initial fetch and scroll-based fetch
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMoreData) return;

    setIsLoading(true);
    try {
      const data: any = await fetchData();
      if (data.error) {
        toastifyError((data as any).error);
      } else {
        setItems((prevItems) => [...prevItems, ...data]);
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
