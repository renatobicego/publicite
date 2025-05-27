import { deleteNotificationById } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { NotificationOptionProps } from "./NotificationCard";

const validDeleteNotification = new Set([
  "notification_magazine_acepted",
  "notification_magazine_rejected",
  "notification_magazine_user_has_been_removed",
  "notification_group_user_accepted",
  "notification_group_user_rejected",
  "notification_group_user_removed_from_group",
  "notification_group_user_new_admin",
  "notification_group_user_removed_admin",
  "notification_user_new_relation_accepted",
  "notifications_user_new_relation_rejected",
  "notification_user_friend_request_accepted",
  "notification_user_friend_request_rejected",
  "notification_post_new_reaction",
  "notification_post_new_comment",
  "notification_post_new_comment_response",
]);

// Create a type from the Set values
type ValidDeleteNotificationType = typeof validDeleteNotification extends Set<
  infer T
>
  ? T
  : never;

const deleteNotification = async (
  id: string,
  event: ValidDeleteNotificationType
) => {
  const res = await deleteNotificationById(event, id);

  return res;
};

// Helper function to check if a string is a valid delete notification event
const isValidDeleteNotification = (
  event: string
): event is ValidDeleteNotificationType => {
  return validDeleteNotification.has(event as ValidDeleteNotificationType);
};

export const checkAndAddDeleteNotification = (
  optionsList: NotificationOptionProps[],
  event: string,
  _id: string,
  deleteNotificationFromContext: (id: string) => void
) => {
  if (isValidDeleteNotification(event)) {
    optionsList.push({
      label: "Eliminar Notificacion",
      onPress: async () => {
        const res = await deleteNotification(_id, event);
        if ("error" in res) {
          toastifyError(res.error);
          return;
        }
        toastifySuccess(res.message);
        deleteNotificationFromContext(_id);
      },
    });
  }
};
