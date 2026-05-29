import { PostBehaviourType, PostCategory, PostLocationForm } from "@/types/postTypes";

export type AdPostType = "good" | "service" | "petition";

export type WizardStep =
  | "idle"
  | "postType"
  | "behaviourType"
  | "title"
  | "description"
  | "price"
  | "condition" // only for good
  | "petitionType" // only for petition
  | "category"
  | "location"
  | "images" // only for good/service
  | "summary"
  | "submitting"
  | "done"
  | "error";

export interface WizardData {
  postType?: AdPostType;
  postBehaviourType?: PostBehaviourType;
  title?: string;
  description?: string;
  price?: number;
  toPrice?: number; // only for petition
  frequencyPrice?: FrequencyPrice; // for service and petition
  condition?: "new" | "used"; // only for good
  petitionType?: "good" | "service"; // only for petition
  category?: string; // category _id
  categoryLabel?: string;
  geoLocation?: PostLocationForm;
  locationDescription?: string;
  images?: File[];
}

export interface WizardMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  type: "text" | "step";
  step?: WizardStep;
}
