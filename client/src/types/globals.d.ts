export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      userType: "Person" | "Business";
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

  type FrequencyPrice = "hour" | "day" | "week" | "month" | "year";
  type PostType = "service" | "good" | "petition"
}
