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
  const notification = generateGroupNotification(
    event,
    {
      name: group.name,
      _id: group._id,
      profilePhotoUrl: group.profilePhotoUrl,
    },
    { username: userSending.username },
    userIdTo,
    userSending._id
  );
  console.log(notification);
  socket?.emit(
    "group_notifications",
    notification,
    (response: { error?: string; success?: boolean }) => {
      console.log(response);
      if (response?.error) {
        console.error("Error emitting group notification:", response.error);
      } else if (response?.success) {
        console.log("Magazine notification emitted successfully");
      } else {
        console.warn("Unexpected response from server:", response);
      }
    }
  );
  socket?.on("error", (error: string) => console.error(error));
};
