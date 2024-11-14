import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import {
  Magazine,
  MagazineNotification,
  MagazineNotificationType,
} from "@/types/magazineTypes";

const generateMagazineNotification = (
  event: MagazineNotificationType,
  magazine: Pick<Magazine, "_id" | "name">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string
) => {
  const notification: Omit<MagazineNotification, "_id"> = {
    ...generateNotification(event, userIdTo, userSending._id),
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
