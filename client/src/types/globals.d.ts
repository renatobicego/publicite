export { };

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
    };
    firstName?: string;
  }
  type ObjectId = string
}