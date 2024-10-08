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
  type UserRelation = "contact" | "friend" | "topfriend";

  type FrequencyPrice = "hour" | "day" | "week" | "month" | "year";
  type PostType = "service" | "good" | "petition";
}
