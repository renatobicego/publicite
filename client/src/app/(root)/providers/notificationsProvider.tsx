"use client";
import useNotifications from "@/utils/hooks/useNotifications";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

// Define the shape of the context
interface NotificationsContextType {
  notifications: BaseNotification[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNotifications: () => Promise<void>;
  newNotificationsFromServer: boolean;
  setNewNotificationsFromServer: React.Dispatch<React.SetStateAction<boolean>>;
  deleteNotification: (id: string) => void;
}

// Create the context with an initial default value
const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// Provider component
export const NotificationsProvider = ({
  children,
  isOpen,
}: {
  children: ReactNode;
  isOpen: boolean;
}) => {
  const {
    notifications,
    isLoading,
    hasMore,
    fetchNotifications,
    deleteNotification,
  } = useNotifications(isOpen);

  const [newNotificationsFromServer, setNewNotificationsFromServer] =
    useState(false);

  useEffect(() => {
    const newNotifications = notifications.some(
      (notification) => !notification.viewed
    );
    setNewNotificationsFromServer(newNotifications);
  }, [notifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        isLoading,
        hasMore,
        fetchNotifications,
        newNotificationsFromServer,
        setNewNotificationsFromServer,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook to use the context
export const useNotificationsContext = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider"
    );
  }
  return context;
};
