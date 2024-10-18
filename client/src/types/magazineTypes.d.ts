export interface Magazine {
  _id: ObjectId;
  name: string;
  sections: MagazineSection[];
  ownerType: "user" | "group";
  description: string;
}

export interface UserMagazine extends Magazine {
  collaborators: ObjectId[] | GetUser[];
  user: ObjectId | GetUser;
  visibility: Visibility;
}

export interface GroupMagazine extends Magazine {
  allowedCollaborators: ObjectId[] | GetUser[];
  visibility: Visibility;
  group: ObjectId | Group;
}

export interface MagazineSection {
  _id: ObjectId;
  title: string;
  isFatherSection: boolean;
  posts: ObjectId[] | Post[];
}
export interface MagazineInvitationNotification {
  _id: ObjectId;
  magazine: Pick<Magazine, "_id" | "name">;
  userInviting: Pick<User, "username">;
  date: string;
}

export type PostUserMagazine = Omit<UserMagazine, "_id">;
export type PostGroupMagazine = Omit<GroupMagazine, "_id">;
export type EditMagazine = Omit<Magazine, "sections"> & {visibility?: Visibility}
