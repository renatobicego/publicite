import { User, UserPerson } from "./userTypes";

export interface Post {
  _id: ObjectId;
  title: string;
  postType: "Service" | "Good" | "Petition";
  description?: string;
  visibility: {
    post: Visibility;
    socialMedia: Visibility;
  };
  recommendations: PostRecommendation[];
  price: number;
  location: PostLocation;
  category: PostCategory;
  comments: PostComment[];
  attachedFiles: PostAttachedFile[];
  author: Author;
  createdAt: string;
}

interface Reviewer extends Pick<UserPerson, "username" | "profilePhotoUrl"> {}
interface Author
  extends Pick<
    UserPerson,
    "username" | "profilePhotoUrl" | "contact" | "name" | "lastName"
  > {}

export interface PostRecommendation {
  _id: ObjectId;
  user: User | ObjectId;
  upvote: boolean;
}

export interface PostLocation {
  _id?: ObjectId;
  lat?: number;
  lng?: number;
  description?: string;
  userSetted?: boolean;
}

export interface PostCategory {
  _id: ObjectId;
  label: string;
}

export interface PostComment {
  _id: ObjectId;
  author: Reviewer | ObjectId;
  comment: string;
  date: string;
  replies: PostComment[];
}

export interface PostAttachedFile {
  _id: ObjectId;
  url: string;
  label: string;
}

export interface PostReview {
  _id: ObjectId;
  author: Reviewer | ObjectId;
  review: string;
  date: string;
  rating: number;
}

export interface Good extends Post {
  imagesUrls: string[];
  year?: number;
  brand?: string;
  model?: string;
  reviews: PostReview[];
  condition: "New" | "Used";
}

export interface GoodPostValues
  extends Omit<
    Good,
    | "_id"
    | "category"
    | "price"
    | "author"
    | "comments"
    | "reviews"
    | "condition"
    | "recommendations"
  > {
  category: ObjectId;
  price?: number;
  author: string;
  condition?: "New" | "Used";
}

export interface Service extends Post {
  imagesUrls: string[];
  frequencyPrice: FrequencyPrice;
  reviews: PostReview[];
}

export interface ServicePostValues
  extends Omit<
    Service,
    | "_id"
    | "category"
    | "price"
    | "author"
    | "comments"
    | "reviews"
    | "condition"
    | "recommendations"
  > {
  category: ObjectId;
  price?: number
  author: string;
  frequencyPrice?: FrequencyPrice;
}
export interface Petition extends Post {
  frequencyPrice?: FrequencyPrice;
  toPrice?: number;
  petitionType: "Good" | "Service";
}

export interface AttachedFileValues {
  file: File | null;
  label: string;
  _id: string;
}