import { UserRelationNotificationType } from "@/types/userTypes";
import {
  acceptChangeContactRequest,
  rejectChangeContactRequest,
  acceptNewContactRequest,
  declineNewContactRequest,
} from "./actions";

// Base messages object
export const userRelationNotificationBaseMessages: Record<
  UserRelationNotificationType,
  {
    message: string;
  }
> = {
  notification_user_friend_request_accepted: {
    message: "ha aceptado tu solicitud de",
  },
  notification_user_new_friend_request: {
    message: "quiere ser tu",
  },
  notification_user_friend_request_rejected: {
    message: "ha rechazado tu solicitud de",
  },
  notification_user_new_relation_accepted: {
    message: "ha aceptado tu nueva solicitud de ser",
  },
  notification_user_new_relation_change: {
    message: "quiere cambiar su relación mutua a",
  },
  notifications_user_new_relation_rejected: {
    message: "ha rechazado tu nueva solicitud de ser",
  },
};

// Actions object extending base messages
export const userRelationNotificationMessages: Record<
  UserRelationNotificationType,
  {
    message: string;
    acceptAction?: Function;
    rejectAction?: Function;
    seeNotifications?: boolean;
  }
> = {
  ...userRelationNotificationBaseMessages,
  notification_user_new_relation_change: {
    ...userRelationNotificationBaseMessages.notification_user_new_relation_change,
    seeNotifications: true,
    acceptAction: acceptChangeContactRequest,
    rejectAction: rejectChangeContactRequest,
  },
  notification_user_new_friend_request: {
    ...userRelationNotificationBaseMessages.notification_user_new_friend_request,
    seeNotifications: true,
    acceptAction: acceptNewContactRequest,
    rejectAction: declineNewContactRequest,
  },
};
