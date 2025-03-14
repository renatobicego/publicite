import { Socket } from "socket.io-client";
import generatePostActivityNotification, {
  PostActivityNotificationPayload,
} from "./generatePostActivityNotification";
import { PostActivityNotificationType } from "@/types/postTypes";

interface PostPayload {
  _id: string;
  title: string;
  imageUrl: string;
  postType: PostType;
}

export const emitPostActivityNotification = <T>(
  socket: Socket | null,
  userIdTo: string, // user to send the notification
  post: PostPayload,
  previousNotificationId: string | null, // if the notification is a follow up of another notification
  payload: PostActivityNotificationPayload
): Promise<SocketResponse<T>> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      return reject(new Error("Socket is not initialized."));
    }

    generatePostActivityNotification(
      userIdTo,
      post,
      previousNotificationId,
      payload
    ).then((notification) => {
      socket?.emit(
        "post_notifications",
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
