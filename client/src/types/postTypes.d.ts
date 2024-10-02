import { GetUser, Group, User, UserPerson } from "./userTypes";

export interface Post {
  _id: ObjectId;
  title: string;
  postType: PostType;
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
  createAt: string;
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
  _id: ObjectId;
  location: {
    type: "Point";
    coordinates: [number, number];
  }
  description: string;
  userSetted: boolean;
}

export interface PostLocationForm {
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

export interface PostCommentForm {
  author: ObjectId;
  comment: string;
  date: string
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
  modelType?: string;
  reviews: PostReview[];
  condition: "new" | "used";
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
  condition?: "new" | "used";
  location: PostLocationForm;
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
  location: PostLocationForm;
  author: string;
  frequencyPrice?: FrequencyPrice;
}
export interface Petition extends Post {
  frequencyPrice?: FrequencyPrice;
  toPrice?: number;
  petitionType: "good" | "service";
}

export interface PetitionPostValues
  extends Omit<
    Petition,
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
  location: PostLocationForm;
  author: string;
  petitionType?: "good" | "service";

}

export interface AttachedFileValues {
  file: File | null;
  label: string;
  _id: string;
}

export interface Magazine {
  _id: ObjectId;
  name: string;
  sections: MagazineSection[];
  ownerType: "user" | "group";
  description: string;
}

export interface UserMagazine extends Magazine{
  collaborators: ObjectId[] | GetUser[];
  user: ObjectId | GetUser;
  visibility: Visibility;
}

export interface GroupMagazine extends Magazine{
  allowedCollaborators: ObjectId[] | GetUser[];
  group: ObjectId | Group;
}

export interface MagazineSection {
  _id: ObjectId;
  title: string;
  isFatherSection: boolean;
  posts: ObjectId[] | Post[];
}

export interface PetitionContact {
  userContacting?: ObjectId;
  post: ObjectId;
  fullName?: string; // for users not registered
  email: string;
  phone?: string; // for users not registered
  message: string;
}

export interface PostContactNotification {
  _id: ObjectId;
  message: string;
  post: Post;
  date: string;
}

export interface PostSharedNotification {
  _id: ObjectId;
  post: Post;
  date: string;
  userSharing: Pick<User, "_id" | "username">;
}

export interface MagazineInvitationNotification {
  _id: ObjectId;
  magazine: Pick<Magazine, "_id" | "name">;
  userInviting: Pick<User, "username">;
  date: string;
}