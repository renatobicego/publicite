import { io } from "socket.io-client";
import { socketUrl } from "./utils/data/urls";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : socketUrl;

export const getSocket = (userId?: string) => {
  return io(URL, {
    query: { userId: userId ? userId : "" }, // Pass user ID as query parameter
    transports: ["websocket"], // Ensure only WebSocket is used
  });
};
