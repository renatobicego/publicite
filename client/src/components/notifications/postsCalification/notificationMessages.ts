import { PostCalificationNotificationType } from "@/types/postTypes";

// Base messages object
export const postCalificationNotificationMessages: Record<
  PostCalificationNotificationType,
  {
    message: string;
  }
> = {
  notification_new_calification_request: {
    message: "Compartí tu opinión sobre",
  },
  notification_new_calification_response: {
    message: "Has recibido una nueva calificación sobre",
  },
};
