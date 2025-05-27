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
  userIdTo: string,
  userIdFrom: string,
  previousNotificationId: string | null
) => {
  const notification: Omit<GroupNotification, "_id"> = {
    ...generateNotification(event, userIdTo, userIdFrom, previousNotificationId),
    frontData: {
      group: {
        ...group,
        userInviting: {...userSending, _id: userIdFrom},
      },
    },
  };
  return notification;
};

export default generateGroupNotification;
