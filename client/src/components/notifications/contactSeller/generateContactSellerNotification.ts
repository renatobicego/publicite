import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import {
  ContactSellerNotification,
  GenerateContactSellerNotification,
  PetitionContactSeller,
} from "@/types/postTypes";

const generateContactSellerNotification = (
  post: ObjectId,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  client: PetitionContactSeller
) => {
  const notification: Omit<GenerateContactSellerNotification, "_id"> = {
    ...generateNotification("", userIdTo, userSending._id, null),
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
