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
    | "Public"
    | "Registered"
    | "Contacts"
    | "Friends"
    | "TopFriends";

  type FrequencyPrice = "hour" | "day" | "week" | "month" | "year";
  type PostType = "Service" | "Good" | "Petition"
}
