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
import { useAuth } from "@clerk/nextjs";

interface SocketContextType {
  socket: Socket | null;
  newNotifications: boolean;
  setNewNotifications: Dispatch<SetStateAction<boolean>>;
  updateSocketToken: () => Promise<Socket>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) => {
  const [newNotifications, setNewNotifications] = useState(false);
  const { getToken } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  // Function to reinitialize the socket with a new token
  const updateSocketToken = async () => {
    const newToken = await getToken();
    if (socket) {
      socket.disconnect(); // Disconnect the current socket
    }

    const newSocket = getSocket(userId, newToken as string); // Create a new socket instance
    setSocket(newSocket);

    // Optionally, add any listeners or setup for the new socket
    newSocket.on("connect", () => {
      console.log("Socket reconnected with new token:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("group_notifications", (data) => {
      console.log("New notification:", data);
      setNewNotifications(true);
    });

    newSocket.on("magazine_notifications", (data) => {
      console.log("New notification:", data);
      setNewNotifications(true);
    });
    return newSocket;
  };

  // Initialize socket on first render
  useEffect(() => {
    if(!socket) 
    updateSocketToken();
    // Cleanup on unmount
    return () => {
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, newNotifications, setNewNotifications, updateSocketToken }}
    >
      {children}
    </SocketContext.Provider>
  );
};
