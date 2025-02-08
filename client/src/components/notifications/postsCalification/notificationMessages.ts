import { PostCalificationNotificationType } from "@/types/postTypes";

// Base messages object
export const postCalificationNotificationMessages: Record<
  PostCalificationNotificationType,
  {
    message: string;
    showUser?: boolean;
  }
> = {
  notification_new_calification_request: {
    message: "ha reacccionado a tu post",
  },
  notification_new_calification_response: {
    message: "ha comentado en tu post",
  },
};
