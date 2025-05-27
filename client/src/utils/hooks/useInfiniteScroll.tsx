import { useEffect } from 'react';

export const useInfiniteScroll = (
  loadMore: () => void,
  isLoading: boolean,
  hasMoreData: boolean,
  errorOccurred: boolean
) => {
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - window.innerHeight * 0.3;

      if (bottomReached && !isLoading && hasMoreData && !errorOccurred) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore, isLoading, hasMoreData, errorOccurred]);
};

