import { Board } from "./board";
import { Magazine, PostCategory } from "./postTypes";

export interface User {
  _id: ObjectId;
  clerkId: string;
  email: string;
  username: string;
  description: string;
  profilePhotoUrl: string;
  countryRegion: string;
  isActive: boolean;
  contact: Contact;
  createdTime: string;
  subscriptions: Subscription[];
  groups: Group[];
  magazines: Magazine[];
  board: Board;
  posts: Post[];
  userRelations: UserRelations[];
  userType: UserType;
  name: string;
  lastName: string;
  userPreferences: UserPreferences;
}

export interface GetUser
  extends Omit<
    User,
    "userPreferences" | "clerkId" | "createdTime" | "isActive"
  > {}

export interface UserPreferences {
  searchPreference: ObjectId[] | PostCategory[];
  backgroundColor: number;
}

export type UserType = "Person" | "Business";

export interface UserPerson extends User {
  gender: string;
  birthDate: string;
}

export interface UserBusiness extends User {
  sector: BusinessSector;
  businessName: string;
}

export interface BusinessSector {
  _id: ObjectId;
  label: string;
  description: string;
}

export interface Contact {
  _id: ObjectId;
  phone: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  website?: string;
}

/**
 * FormTypes
 */
export interface UserPersonFormValues
  extends Omit<
    UserPerson,
    | "_id"
    | "subscriptions"
    | "posts"
    | "board"
    | "userRelations"
    | "contact"
    | "groups"
    | "magazines"
    | "userPreferences"
  > {
  contact: {
    phone: string;
  };
}

export interface UserBusinessFormValues
  extends Omit<
    UserBusiness,
    | "_id"
    | "subscriptions"
    | "posts"
    | "board"
    | "userRelations"
    | "contact"
    | "groups"
    | "magazines"
    | "sector"
    | "name"
    | "lastName"
    | "userPreferences"
  > {
  contact: {
    phone?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    website?: string;
  };
  sector: ObjectId;
  name: string;
  lastName: string;
}

export interface EditPersonProfileProps
  extends Partial<
    Pick<
      UserPersonFormValues,
      "description" | "birthDate" | "gender" | "countryRegion"
    >
  > {
  contact?: Contact;
}

export interface EditBusinessProfileProps
  extends Partial<
    Pick<
      UserBusinessFormValues,
      "businessName" | "countryRegion" | "description" | "contact"
    >
  > {
  sector: BusinessSector | ObjectId;
  contact?: Contact;
}

export type EditProfileProps =
  | EditBusinessProfileProps
  | EditPersonProfileProps;

export interface UserRelations {
  _id: ObjectId;
  userA: User;
  userB: User;
  typeRelationA: UserRelation;
  typeRelationB: UserRelation;
}

export interface ActiveUserRelation
  extends Omit<UserRelations, "userA" | "userB"> {
  userA: ObjectId;
  userB: ObjectId;
}

export interface NewContactRelationNotification {
  _id: ObjectId;
  user: Pick<User, "_id" | "username" | "profilePhotoUrl">;
  typeRelation: UserRelation;
  date: string;
}

export interface UserRelationNotification extends BaseNotification {
  frontData: {
    userRelation: {
      userFrom: Pick<User, "_id" | "username" | "profilePhotoUrl">;
      typeRelation: UserRelation;
      _id?: ObjectId;
    };
  };
}
export type UserRelationNotificationType =
  | "notification_user_new_friend_request" // Usuario A le envia la nueva relación de contacto a Usuario B
  | "notification_user_friend_request_accepted" //
  | "notification_user_friend_request_rejected" //
  | "notification_user_new_relation_change" // Nueva relacion de amistad
  | "notification_user_new_relation_accepted" // Usuario A acepto tu relacion de amistad
  | "notifications_user_new_relation_rejected"; // Usuario A rechazo tu relacion de amistad

export type ElementSharedData = {
  type: ShareTypesEnum;
  _id: string;
  description: string;
  username: string;
  imageUrl?: string;
};

export interface ElementSharedNotification extends BaseNotification {
  frontData: {
    share: ElementSharedData;
  };
}

export type ElementSharedEventTyoe = "notification_new_shared";

export type ShareTypesEnum = "post" | "group" | "magazine" | "user";
