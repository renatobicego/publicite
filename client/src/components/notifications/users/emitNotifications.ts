import { Socket } from "socket.io-client";
import { User, UserRelationNotificationType } from "@/types/userTypes";
import generateUserRelationNotification from "./generateUserRelationNotification";

export const emitUserRelationNotification = (
  socket: Socket | null,
  event: UserRelationNotificationType,
  userIdTo: string,
  typeRelation: UserRelation,
  previousNotificationId: string | null,
  userRelationId?: string
): Promise<{ status?: number; message?: string }> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      return reject(new Error("Socket is not initialized."));
    }
    generateUserRelationNotification(
      event,
      userIdTo,
      typeRelation,
      previousNotificationId
    ).then((notification) => {
      const notificationWIthUserRelationId = {
        ...notification,
        frontData: {
          ...notification.frontData,
          userRelation: {
            ...notification.frontData.userRelation,
            _id: userRelationId,
          },
        },
      };
      socket?.emit(
        "user_notifications",
        userRelationId ? notificationWIthUserRelationId : notification,
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
  });
};
