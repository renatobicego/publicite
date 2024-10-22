import { Socket } from "socket.io-client";
import generateGroupNotification from "./generateGroupNotification";
import { Group } from "@/types/groupTypes";

export const emitNewAdminNotification = (
  socket: Socket | null,
  group: Group,
  userUsernameSending: string,
  userToSendId: string
) => {
  const notification = {
    groupInvitation: generateGroupNotification(
      "notification_group_user_request_sent",
      group,
      { username: userUsernameSending },
      userToSendId
    ),
  };
  socket?.emit("group_notifications", notification);
};
