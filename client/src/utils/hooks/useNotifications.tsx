"use client";
import { getNotifications } from "@/services/userServices";
import { useCallback, useEffect, useState } from "react";
import { toastifyError } from "../functions/toastify";

export type NotificationType = "group";

const useNotifications = (isOpen: boolean) => {
  // is loading
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<BaseNotification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  // Error flag to prevent repeated calls
  const [errorOccurred, setErrorOccurred] = useState(false);
  const fetchNotifications = useCallback(async () => {
    if (isLoading || !hasMore || errorOccurred) return;
    setIsLoading(true);
    try {
      const data = await getNotifications(page);
      if ("error" in data && data.error) {
        toastifyError(data.error);
        setErrorOccurred(true);
        return;
      }
      if ("items" in data) {
        if (data.hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
        setNotifications(prev => [...prev, ...data.items]);
        setHasMore(data.hasMore);
        setErrorOccurred(false);
      }
    } catch (error) {
      toastifyError(error as string);
      setErrorOccurred(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, errorOccurred, page]);

  // Effect to call `fetchNotifications` only after `hasMore` is set to true
  useEffect(() => {
    // Check if `hasMoreData` is true, and if so, call `loadMore`
    if (hasMore && !isLoading && !errorOccurred && page === 1) {
      fetchNotifications();
    }
  }, [isLoading, errorOccurred, page, hasMore, fetchNotifications]);

  // Scroll event handler
  const handleScroll = () => {
    const container = document.getElementById("notifications-popover");
    if (!container || isLoading || !hasMore) return;

    const bottomReached =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight * 1.3;

    if (bottomReached) {
      fetchNotifications();
    }
  };

  useEffect(() => {
    const container = document.getElementById("notifications-popover");

    if (isOpen && container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading, hasMore, fetchNotifications]);

  return {
    notifications,
    isLoading,
    hasMore,
    fetchNotifications,
  };
};

export default useNotifications;
