export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      userType: "Person" | "Business";
      mongoId: ObjectId;
    };
    firstName?: string;
  }
  interface UserPublicMetadata {
    onboardingComplete?: boolean;
    userType: "Person" | "Business";
    mongoId: ObjectId;
  }
  type ObjectId = string;
  type Visibility =
    | "public"
    | "registered"
    | "contacts"
    | "friends"
    | "topfriends";
  type UserRelation = "contacts" | "friends" | "topfriends";

  type FrequencyPrice = "hour" | "day" | "week" | "month" | "year";
  type PostType = "service" | "good" | "petition";

  interface BaseNotification {
    _id: string;
    viewed: boolean;
    event: string;
    date: string;
    backData: {
      userIdTo: string;
      userIdFrom: string;
    };
    isActionsAvailable: boolean;
    previousNotificationId: string | null;
  }

  type NotificationError =
    | "NOTIFICATION_ERROR_BACKEND_INTERNAL_ERROR"
    | "PREVIOUS_ID_MISSING"
    | "NOTIFICATION_ALREADY_EXISTS"
    | "USER_NOT_AUTHORIZED";

  interface SocketResponse<T> {
    status: number;
    message: string;
    body: T;
  }
}
