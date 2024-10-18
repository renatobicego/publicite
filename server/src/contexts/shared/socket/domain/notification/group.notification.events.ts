import { GroupInvitation } from '../entity/group.invitation.notification';

export interface GroupNotificationEvents {
  notification_group_ivitation(data: GroupInvitation): void;
  notification_group_user_delete(data: GroupInvitation): void;
}
