import { createContext, useContext, useState, ReactNode } from "react";

interface NotificationsContextProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const NotificationsIsOpenContext = createContext<
  NotificationsContextProps | undefined
>(undefined);

export const NotificationsIsOpen = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NotificationsIsOpenContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </NotificationsIsOpenContext.Provider>
  );
};

export const useNotificationsIsOpen = () => {
  const context = useContext(NotificationsIsOpenContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
