import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import {
  Magazine,
  MagazineNotification,
  MagazineNotificationType,
} from "@/types/magazineTypes";

const generateMagazineNotification = (
  event: MagazineNotificationType,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  const notification: Omit<MagazineNotification, "_id"> = {
    ...generateNotification(event, userIdTo, userSending._id, previousNotificationId),
    frontData: {
      magazine: {
        ...magazine,
        userInviting: userSending,
      },
    },
  };
  return notification;
};

export default generateMagazineNotification;
