import { GroupInvitation } from '../entity/group.invitation.notification';

export interface GroupNotificationEvents {
  group_notifications(data: GroupInvitation): void;
}
