import { useEffect, useState } from "react";
import MobileNotifications from "./MobileNotifications";
import DesktopNotifications from "./DesktopNotifications";
import { NotificationsProvider } from "@/app/(root)/providers/notificationsProvider";

const Notifications = () => {
  const [screenSize, setScreenSize] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenSize(window.innerWidth);
    }

    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <NotificationsProvider isOpen={isOpen}>
      {screenSize < 1024 ? (
        <MobileNotifications isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <DesktopNotifications isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </NotificationsProvider>
  );
};

export default Notifications;
