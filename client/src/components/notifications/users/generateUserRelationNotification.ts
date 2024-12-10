"use server"
import { User, UserRelationNotification, UserRelationNotificationType } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import { currentUser } from "@clerk/nextjs/server";

const generateUserRelationNotification = async(
  event: UserRelationNotificationType,
  // userFrom: Pick<User, "_id" | "username" | "profilePhotoUrl">,
  userIdTo: string,
  typeRelation: UserRelation,
  previousNotificationId: string | null
) => {
  const user = await currentUser();
  const userFrom: Pick<User, "_id" | "username" | "profilePhotoUrl"> = {
    _id: user?.publicMetadata.mongoId as string,
    username: user?.username as string,
    profilePhotoUrl: user?.imageUrl as string
  }
  const notification: Omit<UserRelationNotification, "_id"> = {
    ...generateNotification(event, userIdTo, userFrom._id, previousNotificationId),
    frontData: {
      userRelation: {
        userFrom,
        typeRelation,
      },
    },
  };
  return notification;
};

export default generateUserRelationNotification;
