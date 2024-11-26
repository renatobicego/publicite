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
  userIdFrom: string
) => {
  const notification: Omit<GroupNotification, "_id"> = {
    ...generateNotification(event, userIdTo, userIdFrom),
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
