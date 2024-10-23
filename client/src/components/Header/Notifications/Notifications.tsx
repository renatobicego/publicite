import { useEffect, useState } from "react";
import MobileNotifications from "./MobileNotifications";
import DesktopNotifications from "./DesktopNotifications";
import { useSocket } from "@/app/socketProvider";
import useNotifications from "@/utils/hooks/useNotifications";

const Notifications = () => {
  const [screenSize, setScreenSize] = useState(0);
  const { socket } = useSocket();

  const [newNotifications, setNewNotifications] = useState(false);
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

  useEffect(() => {
    if (socket) {
      socket.on("group_notifications", (data) => {
        console.log(data);
        setNewNotifications(true);
      });
    }
  }, [socket]);

  return (
    <>
      {screenSize < 1024 ? (
        <MobileNotifications
          newNotifications={newNotifications}
          setNewNotifications={setNewNotifications}
        />
      ) : (
        <DesktopNotifications
          newNotifications={newNotifications}
          setNewNotifications={setNewNotifications}
        />
      )}
    </>
  );
};

export default Notifications;
