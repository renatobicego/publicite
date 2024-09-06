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
  post: Post[];
  userRelations: UserRelations[];
  userType: UserType;
  name: string;
  lastName: string;
}

export type UserType = "Person" | "Business";

export interface UserPerson extends User {
  gender: string;
  birthDate: string;
}

export interface UserBusiness extends User {
  businessSector: BusinessSector;
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
    | "post"
    | "board"
    | "userRelations"
    | "contact"
    | "groups"
    | "magazines"
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
    | "post"
    | "board"
    | "userRelations"
    | "contact"
    | "groups"
    | "magazines"
    | "businessSector"
    | "name"
    | "lastName"
  > {
  contact: {
    phone?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    website?: string;
  };
  businessSector: ObjectId;
}

export interface BoardType {
  _id: ObjectId;
  annotations: string[];
  visibility: Visibility;
  keywords: string[];
  user: Pick<User, "name"> | Pick<UserBusiness, "businessName">;
}


export interface EditPersonProfileProps extends Partial<Pick<UserPersonFormValues, "description" | "birthDate" | "gender" | "countryRegion">>{
  contact?: Contact
}

export interface EditBusinessProfileProps extends Partial<Pick<UserBusinessFormValues, "businessName" | "countryRegion" | "description" | "contact">>{
  businessSector: BusinessSector | ObjectId
  contact?: Contact
}

export type EditProfileProps = EditBusinessProfileProps | EditPersonProfileProps
