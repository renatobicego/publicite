import { PostActivtyNotificationType } from "@/types/postTypes";

// Base messages object
export const postActivitiesNotificationBaseMessages: Record<
  PostActivtyNotificationType,
  {
    message: string;
    showUser?: boolean;
  }
> = {
  notification_post_new_reaction: {
    message: "ha reacccionado a tu post",
    showUser: true,
  },
};

// Actions object extending base messages
export const postActivitiesNotificationMessages: Record<
  PostActivtyNotificationType,
  {
    message: string;
    showUser?: boolean;
    acceptAction?: Function;
    rejectAction?: Function;
    seeNotifications?: boolean;
  }
> = {
  ...postActivitiesNotificationBaseMessages,
  //   notification_user_new_relation_change: {
  //     ...userRelationNotificationBaseMessages.notification_user_new_relation_change,
  //     seeNotifications: true,
  //     acceptAction: acceptChangeContactRequest,
  //     rejectAction: rejectChangeContactRequest,
  //   },
  //   notification_user_new_friend_request: {
  //     ...userRelationNotificationBaseMessages.notification_user_new_friend_request,
  //     seeNotifications: true,
  //     acceptAction: acceptNewContactRequest,
  //     rejectAction: declineNewContactRequest,
  //   },
};
