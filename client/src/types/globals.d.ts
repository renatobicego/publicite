export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
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
