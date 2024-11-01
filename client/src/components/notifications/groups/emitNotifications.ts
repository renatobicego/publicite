import { Socket } from "socket.io-client";
import generateGroupNotification from "./generateGroupNotification";
import { Group, GroupNotificationType } from "@/types/groupTypes";
import { User } from "@/types/userTypes";

export const emitGroupNotification = (
  socket: Socket | null,
  group: Pick<Group, "name" | "_id" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  event: GroupNotificationType
) => {
  const notification = {
    notificationBody: generateGroupNotification(
      event,
      group,
      { username: userSending.username },
      userIdTo,
      userSending._id
    ),
  };
  socket?.emit("group_notifications", notification);
};
