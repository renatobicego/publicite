
import { User, UserPerson } from "./userTypes";

export interface Post {
  _id: ObjectId;
  title: string;
  postType: "Service" | "Good" | "Petition";
  description?: string;
  visibility: Visibility;
  recommendations: PostRecommendation[];
  price: number;
  location: PostLocation;
  category: PostCategory;
  comments: PostComment[];
  attachedFiles: PostAttachedFile[];
  author: Author
}

interface Reviewer extends Pick<UserPerson, "username" | "profilePhotoUrl" > {}
interface Author extends Pick<UserPerson, "username" | "profilePhotoUrl" | "contact" | "name" | "lastName"> {}

export interface PostRecommendation {
  _id: ObjectId;
  user: User | ObjectId;
  upvote: boolean;
}

export interface PostLocation {
  _id: ObjectId;
  latitude: number;
  longitude: number;
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

export interface Service extends Post {
  imagesUrls: string[];
  frequencyPrice: FrequencyPrice;
  reviews: PostReview[];
}

export interface Petition extends Post {
  frequencyPrice?: FrequencyPrice;
  toPrice?: number;
}
