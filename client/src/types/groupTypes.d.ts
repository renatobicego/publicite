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

export interface EditGroupInterface
  extends Omit<Group, "admins" | "members" | "magazines"> {}
export interface GroupNotification extends BaseNotification {
  backData: {
    userToSendId: string;
  };
  frontData: {
    group: Pick<Group, "_id" | "name" | "profilePhotoUrl">;
    userInviting: Pick<User, "username">;
  }
}

export type GroupNotificationType =
  | "notification_group_user_delete"
  | "notification_group_user_added"
  | "notification_group_user_request_rejected"
  | "notification_group_user_invite_declined"
  | "notification_group_user_request_sent"
  | "notification_group_user_new_admin";
