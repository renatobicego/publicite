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
    "userPreferences" | "clerkId" | "userRelations" | "createdTime" | "isActive"
  > {
  userRelations: User[];
}

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

export interface Group {
  _id: ObjectId;
  members: ObjectId[] | User[];
  admins: ObjectId[] | User[];
  name: string;
  details: string;
  rules: string;
  magazines: ObjectId[] | Magazine[];
  profilePhotoUrl: string;
  visibility: "private" | "public";
}

export interface UserRelations {
  _id: ObjectId;
  userA: User;
  userB: User;
  typeRelationA: UserRelation;
  typeRelationB: UserRelation;
}

export interface NewContactRelationNotification {
  _id: ObjectId;
  user: Pick<User, "_id" | "username" | "profilePhotoUrl">;
  typeRelation: UserRelation;
  date: string;
}

export interface GroupInvitationNotification {
  _id: ObjectId;
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">;
  userInviting: Pick<User, "username">;
  date: string;
}
