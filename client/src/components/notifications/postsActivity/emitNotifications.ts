import { Socket } from "socket.io-client";
import generatePostActivityNotification from "./generatePostActivityNotification";
import { PostActivtyNotificationType } from "@/types/postTypes";

interface PostPayload {
  _id: string;
  title: string;
  imageUrl: string;
  postType: PostType;
}

export const emitPostActivityNotification = <T>(
  socket: Socket | null,
  event: PostActivtyNotificationType,
  userIdTo: string, // user to send the notification
  post: PostPayload,
  previousNotificationId: string | null, // if the notification is a follow up of another notification
  payload: {
    emoji: string;
  }
): Promise<SocketResponse<T>> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      return reject(new Error("Socket is not initialized."));
    }

    generatePostActivityNotification(
      event,
      userIdTo,
      post,
      previousNotificationId,
      payload
    ).then((notification) => {
      console.log(notification);
      socket?.emit(
        "post_notifications",
        notification,
        (response: SocketResponse<T>) => {
          console.log(response);
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
