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
  const notification: GroupNotification = {
    ...generateNotification(event),
    frontData: {
      group,
      userInviting: userSending,
    },
    backData: {
      userToSendId,
    },
  };
  return notification;
};

export default generateGroupNotification
