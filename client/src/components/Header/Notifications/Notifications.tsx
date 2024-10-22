import { use, useEffect, useState } from "react";
import MobileNotifications from "./MobileNotifications";
import DesktopNotifications from "./DesktopNotifications";
import { useSocket } from "@/app/socketProvider";

const Notifications = () => {
  const [screenSize, setScreenSize] = useState(0);
  const {socket} = useSocket();
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
      socket.on("notification_group_user_request_sent", (data) => {
        console.log(data);
      });
    }
  }, [socket]);

  return (
    <>
      {screenSize < 1024 ? <MobileNotifications /> : <DesktopNotifications />}
    </>
  );
};

export default Notifications;
