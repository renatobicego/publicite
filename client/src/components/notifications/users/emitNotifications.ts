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
) => {
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
    }
    socket?.emit(
      "user_notifications",
      userRelationId ? notificationWIthUserRelationId : notification,
      (response: { error?: string; success?: boolean }) => {
        console.log(response);
        if (response?.error) {
          console.error("Error emitting user relation notification:", response.error);
        } else if (response?.success) {
          console.log("Magazine notification emitted successfully");
        } else {
          console.warn("Unexpected response from server:", response);
        }
      }
    );
  })
  socket?.on("error", (error: string) => console.error(error));
};
