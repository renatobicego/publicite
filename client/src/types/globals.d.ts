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
    | "Private"
    | "Registered"
    | "Contacts"
    | "Friends"
    | "TopFriends";

  type FrequencyPrice = "Hourly" | "Weekly" | "Monthly" | "Yearly";
}
