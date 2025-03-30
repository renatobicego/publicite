import { NotificationGroup } from '../entity/notification.group.entity';

export interface NotificationGroupServiceInterface {
  saveNotificationGroupAndSentToUserAndGroup(
    notificationGroup: NotificationGroup,
  ): Promise<any>;
}
