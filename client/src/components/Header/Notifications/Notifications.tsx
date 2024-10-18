import { useEffect, useState } from "react";
import MobileNotifications from "./MobileNotifications";
import DesktopNotifications from "./DesktopNotifications";
import { io } from "socket.io-client"; // Import socket.io-client
import { useUser } from "@clerk/nextjs";
import { socketUrl } from "@/utils/data/urls";

const Notifications = () => {
  const [screenSize, setScreenSize] = useState(0);
  const { user } = useUser();
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Initialize Socket.IO connection
      const socketInstance = io(socketUrl, {
        query: { userId: user?.publicMetadata.mongoId }, // Pass user ID as query parameter
        transports: ['websocket'], // Ensure only WebSocket is used
      });

      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

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

  // Log socket connection status
  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (err: any) => {
        console.log("Socket connection error:", err);
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
