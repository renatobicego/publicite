import {
  Group,
  GroupNotification,
  GroupNotificationType,
} from "@/types/groupTypes";
import generateNotification from "../generateNotification";
import { User } from "@/types/userTypes";

const generateGroupNotification = (
  event: GroupNotificationType,
  group: Group,
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
  console.log(notification);
  return notification;
};

export default generateGroupNotification;
