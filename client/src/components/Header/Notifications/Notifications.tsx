import { useEffect, useState } from "react";
import MobileNotifications from "./MobileNotifications";
import DesktopNotifications from "./DesktopNotifications";

const Notifications = () => {
  const [screenSize, setScreenSize] = useState(0);
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
    <>
      {screenSize < 1024 ? (
        <MobileNotifications
        />
      ) : (
        <DesktopNotifications
        />
      )}
    </>
  );
};

export default Notifications;
