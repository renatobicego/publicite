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
  type ObjectId = string;
  type Visibility =
    | "public"
    | "registered"
    | "contacts"
    | "friends"
    | "topfriends";
  type UserRelation = "contact" | "friend" | "topfriend";

  type FrequencyPrice = "hour" | "day" | "week" | "month" | "year";
  type PostType = "service" | "good" | "petition";
}
