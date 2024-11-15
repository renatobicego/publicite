import { Socket } from "socket.io-client";
import generateGroupNotification from "./generateMagazineNotification";
import { User } from "@/types/userTypes";
import { Magazine, MagazineNotificationType } from "@/types/magazineTypes";
import { useAuth } from "@clerk/nextjs";

export const emitMagazineNotification = (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  event: MagazineNotificationType
) => {
  const notification = {
    notificationBody: generateGroupNotification(
      event,
      { name: magazine.name, _id: magazine._id, ownerType: magazine.ownerType },
      { username: userSending.username, _id: userSending._id },
      userIdTo,
    ),
  };
  console.log(notification)
  socket?.emit("magazine_notifications", notification, (response: { error?: string; success?: boolean }) => {
    if (response?.error) {
      console.error("Error emitting magazine notification:", response.error);
    } else if (response?.success) {
      console.log("Magazine notification emitted successfully");
    } else {
      console.warn("Unexpected response from server:", response);
    }
  });
  socket?.on("error", (error: string) => console.error(error));

};
