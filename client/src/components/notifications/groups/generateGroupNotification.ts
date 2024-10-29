import {
  Group,
  GroupNotification,
  GroupNotificationType,
} from "@/types/groupTypes";
import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";

const generateGroupNotification = (
  event: GroupNotificationType,
  group: Pick<Group, "name" | "_id" | "profilePhotoUrl">,
  userSending: Pick<User, "username">,
  userToSendId: string
) => {
  const notification: Omit<GroupNotification, "_id"> = {
    ...generateNotification(event, userToSendId),
    frontData: {
      group,
      userInviting: userSending,
    },
  };
  return notification;
};

export default generateGroupNotification;
