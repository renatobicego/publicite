import { GetUser, Group, User, UserPerson } from "./userTypes";

export interface Post {
  _id: ObjectId;
  title: string;
  postType: PostType;
  description?: string;
  visibility: {
    post: UserRelation | "public";
    socialMedia: "public" | "registered";
  };
  recommendations: PostRecommendation[];
  price: number;
  geoLocation: PostLocation;
  category: PostCategory[];
  comments: PostComment[];
  attachedFiles: PostAttachedFile[];
  author: Author;
  createAt: string;
  endDate: string;
  reactions: PostReaction[];
  postBehaviourType: PostBehaviourType;
  isActive: boolean;
}

type PostBehaviourType = "libre" | "agenda";

interface Reviewer
  extends Pick<UserPerson, "_id" | "username" | "profilePhotoUrl"> {}
interface Author
  extends Pick<
    UserPerson,
    "username" | "profilePhotoUrl" | "contact" | "name" | "lastName" | "_id"
  > {}

export interface PostRecommendation {
  _id: ObjectId;
  user: User | ObjectId;
  upvote: boolean;
}

export interface PostLocation {
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  description: string;
  userSetted: boolean;
  ratio: number;
}

export interface PostLocationForm {
  _id?: ObjectId;
  lat?: number;
  lng?: number;
  description?: string;
  userSetted?: boolean;
  ratio?: number;
}

export interface PostCategory {
  _id: ObjectId;
  label: string;
}

export interface PostComment {
  _id: ObjectId;
  user: Reviewer | ObjectId;
  comment: string;
  createdAt: string;
  response?: PostComment;
  isEdited: boolean;
}

export interface PostCommentForm {
  comment: string;
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
  year?: number | null;
  brand?: string | null;
  modelType?: string | null;
  reviews: PostReview[];
  condition: "new" | "used";
}

export interface CreatePostValues
  extends Omit<
    Post,
    | "_id"
    | "author"
    | "comments"
    | "price"
    | "category"
    | "recommendations"
    | "geoLocation"
    | "reactions"
    | "isActive"
  > {
  category: ObjectId;
  price?: number;
  author: string;
  geoLocation: PostLocationForm;
}

export interface GoodPostValues
  extends CreatePostValues,
    Omit<
      Good,
      | "_id"
      | "reviews"
      | "comments"
      | "recommendations"
      | "reactions"
      | "isActive"
    > {
  condition?: "new" | "used";
}

export interface Service extends Post {
  imagesUrls: string[];
  frequencyPrice: FrequencyPrice;
  reviews: PostReview[];
}

export interface ServicePostValues
  extends CreatePostValues,
    Omit<
      Service,
      | "frequencyPrice"
      | "reviews"
      | "comments"
      | "recommendations"
      | "_id"
      | "reactions"
      | "isActive"
    > {
  frequencyPrice?: FrequencyPrice;
}
export interface Petition extends Post {
  frequencyPrice?: FrequencyPrice;
  toPrice?: number | null;
  petitionType: "good" | "service";
}

export interface PetitionPostValues
  extends CreatePostValues,
    Omit<
      Petition,
      | "petitionType"
      | "_id"
      | "recommendations"
      | "comments"
      | "reactions"
      | "isActive"
    > {
  petitionType?: "good" | "service";
}

export interface AttachedFileValues {
  file: File | null;
  label: string;
  _id: string;
}

export interface PetitionContactSeller {
  clientId?: string;
  name: string;
  post: ObjectId;
  email: string;
  lastName: string;
  username?: string;
  phone?: string;
  message: string;
}

export interface GetContactSellersPetitionDTO {
  _id: string;
  client: Omit<PetitionContactSeller, "post">;
  post: PostCalificationData;
  isOpinionRequested: boolean;
  date: string;
}
export interface PostSharedNotification {
  _id: ObjectId;
  post: Post;
  date: string;
  userSharing: Pick<User, "_id" | "username">;
}

export interface ReviewPostNotification {
  _id: ObjectId;
  post: Post;
  date: string;
  userAsking: Pick<User, "_id" | "username">;
}

export type PostDataNotification = {
  _id: string;
  title: string;
  imageUrl: string;
  postType: PostType;
};

export type BasePostActivityProps = {
  post: PostDataNotification;
  user: Pick<User, "username">;
};

export interface PostActivityNotification extends BaseNotification {
  frontData: {
    postActivity:
      | (BasePostActivityProps & {
          notificationPostType: "reaction";
          postReaction?: {
            emoji: string;
          };
        })
      | (BasePostActivityProps & {
          notificationPostType: "comment";
          postComment?: {
            comment: string;
          };
        })
      | (BasePostActivityProps & {
          notificationPostType: "response";
          postResponse?: {
            author: string;
            commentId: string;
            response: string;
          };
        });
  };
}

export interface PostReaction {
  _id: ObjectId;
  user: ObjectId;
  reaction: string;
}

export type PostActivityNotificationType =
  | "notification_post_new_reaction" // Han reaccionado al post
  | "notification_post_new_comment" // Han comentado en el post
  | "notification_post_new_comment_response"; // Han respondido a un comentario

export interface ContactSellerNotification extends BaseNotification {
  frontData: {
    contactSeller: {
      post: PostCalificationData;
      client: PetitionContactSeller;
    };
  };
}

export interface GenerateContactSellerNotification extends BaseNotification {
  frontData: {
    contactSeller: {
      post: ObjectId;
      client: PetitionContactSeller;
    };
  };
}

export type PostCalificationNotificationType =
  | "notification_new_calification_request"
  | "notification_new_calification_response";

export interface PostCalificationData {
  _id: ObjectId;
  title: string;
  author: string;
  description: string;
  imagesUrls: string[];
  postType: PostType;
}

export interface PostCalificationRequest {
  postCalificationType: "request";
  post: PostCalificationData;
  contactSeller_id: ObjectId;
}

export interface PostCalificationResponse {
  postCalificationType: "response";
  post: PostCalificationData;
  contactSeller_id: any;
  review: {
    author: ObjectId;
    review: string;
    date?: Date;
    rating: number;
  };
}

export interface PostCalificationNotification extends BaseNotification {
  frontData: {
    postCalification: PostCalificationRequest | PostCalificationResponse;
  };
}
