import { User } from "./userTypes";

export interface Group {
  _id: ObjectId;
  alias: string;
  members: ObjectId[] | User[];
  admins: ObjectId[] | User[];
  name: string;
  details: string;
  rules: string;
  magazines: ObjectId[] | Magazine[];
  profilePhotoUrl: string;
  visibility: "private" | "public";
  creator: ObjectId;
}

export interface GroupAdmin extends Group {
  groupNotificationsRequest: {
    joinRequests: Pick<User, "_id" | "username" | "profilePhotoUrl">[];
    groupInvitations: Pick<User, "_id" | "username" | "profilePhotoUrl">[];
  }
}

export interface GetGroups {
  group: Group;
  isMember: boolean;
  hasJoinRequest: boolean;
  hasGroupRequest: boolean;
}

export interface EditGroupInterface
  extends Omit<Group, "admins" | "members" | "magazines" | "creator"> {}
export interface GroupNotification extends BaseNotification {
  frontData: {
    group: Pick<Group, "_id" | "name" | "profilePhotoUrl">;
    userInviting: Pick<User, "username">;
  };
}

export type GroupNotificationType =
  | "notification_group_new_user_invited" // Te han invitado a un grupo
  | "notification_group_new_user_added" // Te han agregado a un grupo
  | "notification_group_user_accepted" // Te han aceptado en un grupo
  | "notification_group_user_rejected" // Te han rechazado en un grupo
  | "notification_group_user_rejected_group_invitation" // Usuario B rechazó unirse al grupo
  | "notification_group_user_request_group_invitation" // Usuario A quiere pertenecer a un grupo
  | "notification_group_user_removed_from_group" // Te han eliminado del grupo
  | "notification_group_user_new_admin" // Te han convertido en administrador
  | "notification_group_user_removed_admin"; // Te han eliminado como administrador
