import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import {
  GenerateContactSellerNotification,
  PetitionContactSeller,
} from "@/types/postTypes";

const generateContactSellerNotification = (
  post: ObjectId,
  userIdTo: string,
  client: PetitionContactSeller,
  userSending: Pick<User, "_id" | "username"> | null
) => {
  const notification: Omit<GenerateContactSellerNotification, "_id"> = {
    ...generateNotification(
      "notification_new_contact",
      userIdTo,
      userSending ? userSending._id : "",
      null
    ),
    frontData: {
      contactSeller: {
        post,
        client,
      },
    },
  };
  return notification;
};

export default generateContactSellerNotification;
