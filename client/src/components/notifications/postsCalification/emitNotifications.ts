import { Socket } from "socket.io-client";
import generatePostCalificationNotification, {
  PostCalificationNotificationPayload,
} from "./generatePostCalificationNotification";

export const emitPostCalificationNotification = <T>(
  socket: Socket | null,
  userIdFrom: string,
  userIdTo: string, // user to send the notification
  payload: PostCalificationNotificationPayload,
  previousNotificationId: string | null // if the notification is a follow up of another notification
): Promise<SocketResponse<T>> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      return reject(new Error("Socket is not initialized."));
    }

    generatePostCalificationNotification(
      payload.event,
      userIdFrom,
      userIdTo,
      previousNotificationId,
      payload
    ).then((notification) => {
      socket?.emit(
        "post_calification_notifications",
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
