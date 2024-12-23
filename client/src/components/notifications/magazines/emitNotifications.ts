import { Socket } from "socket.io-client";
import generateGroupNotification from "./generateMagazineNotification";
import { User } from "@/types/userTypes";
import { Magazine, MagazineNotificationType } from "@/types/magazineTypes";

export const emitMagazineNotification = (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  event: MagazineNotificationType,
  previousNotificationId: string | null
): Promise<{ status?: number; message?: string }> => {
  return new Promise((resolve, reject) => {
    const notification = generateGroupNotification(
      event,
      { name: magazine.name, _id: magazine._id, ownerType: magazine.ownerType },
      { username: userSending.username, _id: userSending._id },
      userIdTo,
      previousNotificationId
    );
    console.log(notification);
    socket?.emit(
      "magazine_notifications",
      notification,
      (response: { status?: number; message?: string }) => {
        console.log(response);
        if (response?.status === 200) {
          resolve(response);
        } else {
          reject(
            new Error(response?.message || "Error al enviar la notificación.")
          );
        }
      }
    );
  });
};
