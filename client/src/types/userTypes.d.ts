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
  userType: "Person" | "Business";
  name: string;
  lastName: string
}

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
    twitter?: string;
    website?: string;
}

/**
 * FormTypes
 */
export interface UserPersonFormValues
  extends Omit<
    UserPerson,
    "_id" | "subscriptions" | "post" | "board" | "userRelations" | "contact" | "groups" | "magazines"
  > {
    contact: {
      phone: string;
    }
  }

  export interface UserBusinessFormValues
  extends Omit<
    UserBusiness,
    "_id" | "subscriptions" | "post" | "board" | "userRelations" | "contact" | "groups" | "magazines" | "businessSector" | "name" | "lastName"
  > {
    contact: {
      phone?: string;
      instagram?: string;
      facebook?: string;
      twitter?: string;
      website?: string;
    };
    businessSector: ObjectId
  }

