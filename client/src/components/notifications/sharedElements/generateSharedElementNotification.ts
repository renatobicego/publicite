"use server";

import {
  PostCalificationData,
  PostCalificationNotification,
  PostCalificationNotificationType,
  PostCalificationRequest,
  PostCalificationResponse,
} from "@/types/postTypes";
import generateNotification from "../generateNotification";
import {
  ElementSharedData,
  ElementSharedEventTyoe,
  ElementSharedNotification,
} from "@/types/userTypes";

const generateSharedElementNotification = async (
  event: ElementSharedEventTyoe,
  userFromId: string,
  userIdTo: string,
  previousNotificationId: string | null,
  payload: ElementSharedData
) => {
  const baseNotification = generateNotification(
    event,
    userIdTo,
    userFromId,
    previousNotificationId
  );

  const notification: Omit<ElementSharedNotification, "_id"> = {
    ...baseNotification,
    frontData: {
      share: payload,
    },
  };
  return notification;
};

export default generateSharedElementNotification;
