"use client";
import useNotifications from "@/utils/hooks/useNotifications";
import { createContext, useContext, ReactNode } from "react";

// Define the shape of the context
interface NotificationsContextType {
  notifications: BaseNotification[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNotifications: () => Promise<void>;
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
  const { notifications, isLoading, hasMore, fetchNotifications } =
    useNotifications(isOpen);

  return (
    <NotificationsContext.Provider
      value={{ notifications, isLoading, hasMore, fetchNotifications }}
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
