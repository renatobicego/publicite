"use server";
import { User } from "@/types/userTypes";
import generateNotification from "../generateNotification";
import { currentUser } from "@clerk/nextjs/server";
import {
  PostActivityNotification,
  PostActivtyNotificationType,
} from "@/types/postTypes";

type NewReactionPayload = {
  emoji: string;
};

type NewCommentPayload = {
  comment: string;
};

type NewCommentResponsePayload = {
  author: string;
  commentId: string;
  response: string;
};

// Create a mapped type for payloads
type PayloadMap = {
  notification_post_new_reaction: NewReactionPayload;
  notification_post_new_comment: NewCommentPayload;
  notification_post_new_comment_response: NewCommentResponsePayload;
};

// Create the PostActivityNotificationPayload type
export type PostActivityNotificationPayload = {
  [K in PostActivtyNotificationType]: {
    event: K;
    payload: PayloadMap[K];
  }
}[PostActivtyNotificationType];

// Update the function signature
const generatePostActivityNotification = async(
  userIdTo: string,
  post: {
    _id: string;
    title: string;
    imageUrl: string;
    postType: PostType;
  },
  previousNotificationId: string | null,
  eventAndPayload: PostActivityNotificationPayload
) => {
  // Function implementation
  const { event, payload } = eventAndPayload;
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
    case "notification_post_new_comment_response":
      const payloadParsedResponse = payload as {
        author: string;
        commentId: string;
        response: string;
      };
      const notificationResponse: Omit<PostActivityNotification, "_id"> = {
        ...generateNotification(
          event,
          userIdTo,
          user?.publicMetadata.mongoId as string,
          previousNotificationId
        ),
        frontData: {
          postActivity: {
            notificationPostType: "response",
            post,
            user: userFrom,
            postResponse: {
              ...payloadParsedResponse,
            },
          },
        },
      };
      return notificationResponse;
  }
};

export default generatePostActivityNotification;
