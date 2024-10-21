"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { getSocket } from "@/socket";

const useSocket = () => {
  const { user } = useUser();

  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = getSocket(user?.publicMetadata.mongoId);
    setSocket(socketInstance);
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user?.publicMetadata.mongoId]);
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
    }
  }, [socket]);

  return socket;
};

export default useSocket;
