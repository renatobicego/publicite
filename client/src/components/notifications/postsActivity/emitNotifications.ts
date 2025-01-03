import { Socket } from "socket.io-client";
import generatePostActivityNotification from "./generatePostActivityNotification";
import { PostActivtyNotificationType } from "@/types/postTypes";

export const emitPostActivityNotification = (
  socket: Socket | null,
  event: PostActivtyNotificationType,
  userIdTo: string,
  post: {
    _id: string;
    title: string;
    imageUrl: string;
    postType: PostType;
  },
  previousNotificationId: string | null,
  payload: {
    emoji: string;
  }
): Promise<{ status?: number; message?: string }> => {
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
      socket?.emit(
        "post_notifications",
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
  });
};
