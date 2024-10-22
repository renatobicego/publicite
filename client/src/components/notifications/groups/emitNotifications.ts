import { Socket } from "socket.io-client";
import generateGroupNotification from "./generateGroupNotification";
import { Group, GroupNotificationType } from "@/types/groupTypes";

export const emitGroupNotification = (
  socket: Socket | null,
  group: Group,
  userUsernameSending: string,
  userToSendId: string,
  event: GroupNotificationType
) => {
  const notification = {
    groupInvitation: generateGroupNotification(
      event,
      group,
      { username: userUsernameSending },
      userToSendId
    ),
  };
  socket?.emit("group_notifications", notification);
};
