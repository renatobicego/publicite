"use server";

import {
  PostCalificationData,
  PostCalificationNotification,
  PostCalificationNotificationType,
  PostCalificationRequest,
  PostCalificationResponse,
} from "@/types/postTypes";
import generateNotification from "../generateNotification";

// Create a mapped type for payloads
type PayloadMap = {
  notification_new_calification_request: PostCalificationRequest;
  notification_new_calification_response: PostCalificationResponse;
};

// Create the PostCalificationNotificationPayload type
export type PostCalificationNotificationPayload = {
  [K in PostCalificationNotificationType]: {
    event: K;
    payload: PayloadMap[K];
  };
}[PostCalificationNotificationType];

const generatePostCalificationNotification = async (
  event: PostCalificationNotificationType,
  userFromId: string,
  userIdTo: string,
  previousNotificationId: string | null,
  payload: PostCalificationNotificationPayload
) => {
  const baseNotification = generateNotification(
    event,
    userIdTo,
    userFromId,
    previousNotificationId
  );

  const notification: Omit<PostCalificationNotification, "_id"> = {
    ...baseNotification,
    frontData: {
      postCalification: payload.payload,
    },
  };
  return notification;
};

export default generatePostCalificationNotification;
