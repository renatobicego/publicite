"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/socket";

interface SocketContextType {
  socket: Socket | null;
  newNotifications: boolean;
  setNewNotifications: Dispatch<SetStateAction<boolean>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
  const [newNotifications, setNewNotifications] = useState(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = getSocket(userId);
    setSocket(socketInstance);
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //   Log socket connection status
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
      socket.on("group_notifications", (data) => {
        console.log(data);
        setNewNotifications(true);
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{ socket, newNotifications, setNewNotifications }}
    >
      {children}
    </SocketContext.Provider>
  );
};
