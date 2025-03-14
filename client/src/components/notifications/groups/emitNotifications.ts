import { Socket } from "socket.io-client";
import generateGroupNotification from "./generateGroupNotification";
import { Group, GroupNotificationType } from "@/types/groupTypes";
import { User } from "@/types/userTypes";

export const emitGroupNotification = (
  socket: Socket | null,
  group: Pick<Group, "name" | "_id" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  event: GroupNotificationType,
  previousNotificationId: string | null
): Promise<{ status?: number; message?: string }> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      return reject(new Error("Socket is not initialized."));
    }

    const notification = generateGroupNotification(
      event,
      {
        name: group.name,
        _id: group._id,
        profilePhotoUrl: group.profilePhotoUrl,
      },
      { username: userSending.username },
      userIdTo,
      userSending._id,
      previousNotificationId
    );

    socket.emit(
      "group_notifications",
      notification,
      (response: { status?: number; message?: string }) => {
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
