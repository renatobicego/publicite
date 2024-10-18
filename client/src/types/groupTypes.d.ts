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

export interface EditGroupInterface extends Omit<Group, "admins" | "members"> {}
export interface GroupInvitationNotification {
  _id: ObjectId;
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">;
  userInviting: Pick<User, "username">;
  date: string;
  type: GroupNotificationType;
}

export type GroupNotificationType =
  | "groupInvitation"
  | "admin"
  | "memberDeleted"
  | "newMemberRequest"
  | "groupAccepted"
  | "groupDeclined";