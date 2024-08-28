export interface User {
  _id: string;
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
  name: string
}

export interface UserPerson extends User {
  lastName: string;
  gender: string;
  birthDate: string;
}

export interface UserBusiness extends User {
  businessSector: BusinessSector;
}

export interface BusinessSector {
  _id: string;
  label: string;
  description: string;
}

export interface Contact {
    _id: string;
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
    // contact: {
    //   phone: string;
    // }
    contact: string
  }

  export interface UserBusinessFormValues
  extends Omit<
    UserBusiness,
    "_id" | "subscriptions" | "post" | "board" | "userRelations" | "contact" | "groups" | "magazines" | "businessSector"
  > {
    contact: {
      phone?: string;
      instagram?: string;
      facebook?: string;
      twitter?: string;
      website?: string;
    };
    businessSector: string
  }

