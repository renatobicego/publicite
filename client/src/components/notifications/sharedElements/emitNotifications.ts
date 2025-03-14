import { ElementSharedData } from "@/types/userTypes";
import { Socket } from "socket.io-client";
import generateSharedElementNotification from "./generateSharedElementNotification";

export const emitElementSharedNotification = <T>(
  socket: Socket | null,
  userIdFrom: string,
  userIdTo: string, // user to send the notification
  payload: ElementSharedData,
  previousNotificationId: string | null // if the notification is a follow up of another notification
): Promise<SocketResponse<T>> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      return reject(new Error("Socket is not initialized."));
    }

    generateSharedElementNotification(
      "notification_new_shared",
      userIdFrom,
      userIdTo,
      previousNotificationId,
      payload
    ).then((notification) => {
      socket?.emit(
        "share_calification_notifications",
        notification,
        (response: SocketResponse<T>) => {
          if (response?.status === 200) {
            resolve(response);
          } else {
            reject(
              new Error(response?.message || "Error al enviar la notificación.")
            );
          }
        }
      );
    });
  });
};
