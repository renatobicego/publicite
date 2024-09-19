import { useState, useEffect, useCallback } from "react";

// Custom hook for infinite scroll and data fetching
export const useInfiniteFetch = (fetchData: () => Promise<any>, hasMoreData: boolean) => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // Function to handle initial fetch and scroll-based fetch
  const loadMore = useCallback(() => {
    if (isLoading || !hasMoreData) return;

    setIsLoading(true);
    fetchData().then(newItems => {
      setItems((prevItems) => [...prevItems, ...newItems]);
      setIsLoading(false);
    });
  }, [isLoading, hasMoreData, fetchData]);

  // Fetch data on initial render
  useEffect(() => {
    loadMore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
