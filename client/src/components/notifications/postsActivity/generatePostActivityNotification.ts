"use server";
import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import { currentUser } from "@clerk/nextjs/server";
import {
  PostActivityNotification,
  PostActivtyNotificationType,
} from "@/types/postTypes";

const generatePostActivityNotification = async (
  event: PostActivtyNotificationType,
  userIdTo: string,
  post: {
    _id: string;
    title: string;
    imageUrl: string;
    postType: PostType;
  },
  previousNotificationId: string | null,
  payload: Object
) => {
  const user = await currentUser();
  const userFrom: Pick<User, "username"> = {
    username: user?.username as string,
  };
  switch (event) {
    case "notification_post_new_reaction":
      const payloadParsed = payload as {
        emoji: string;
      };
      const notification: Omit<PostActivityNotification, "_id"> = {
        ...generateNotification(
          event,
          userIdTo,
          user?.publicMetadata.mongoId as string,
          previousNotificationId
        ),
        frontData: {
          postActivity: {
            notificationPostType: "reaction",
            post,
            user: userFrom,
            postReaction: {
              ...payloadParsed,
            },
          },
        },
      };
      return notification;
    case "notification_post_new_comment":
      const payloadParsedComment = payload as {
        comment: string;
      };
      const notificationComment: Omit<PostActivityNotification, "_id"> = {
        ...generateNotification(
          event,
          userIdTo,
          user?.publicMetadata.mongoId as string,
          previousNotificationId
        ),
        frontData: {
          postActivity: {
            notificationPostType: "comment",
            post,
            user: userFrom,
            postComment: {
              ...payloadParsedComment,
            },
          },
        },
      };
      return notificationComment;
  }
};

export default generatePostActivityNotification;
