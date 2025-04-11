import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { NotificationGroup } from '../../domain/entity/notification.group.entity';
import { NotificationGroupServiceInterface } from '../../domain/service/notification.group.service.interface';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import {
  eventsThatMakeNotificationActionsInactive_GROUP,
  GROUP_NOTIFICATION_send_group,
} from '../../domain/allowed-events/allowed.events.notifications';
import { PreviousIdMissingException } from 'src/contexts/module_shared/exceptionFilter/previousIdMissingException';
import { GroupServiceInterface } from 'src/contexts/module_group/group/domain/service/group.service.interface';
import { Inject } from '@nestjs/common';
import { NotificationRepositoryInterface } from '../../domain/repository/notification.repository.interface';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';

export class NotificationGroupService
  implements NotificationGroupServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject('GroupServiceInterface')
    private readonly groupService: GroupServiceInterface,
    @Inject('NotificationRepositoryInterface')
    private readonly notificationRepository: NotificationRepositoryInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) {}

  async saveNotificationGroupAndSentToUserAndGroup(
    notificationGroup: NotificationGroup,
  ): Promise<any> {
    const event: string = notificationGroup.getEvent;
    const userNotificationOwner = notificationGroup.getUser;
    const userIdFrom = notificationGroup.getbackData.userIdFrom;
    const session = await this.connection.startSession();
    let notificationId: Types.ObjectId;
    if (!event || !userNotificationOwner || !userIdFrom)
      throw new Error('Missing event, userNotificationOwner or userIdFrom');
    try {
      await session.withTransaction(async () => {
        this.logger.log('Saving notification....');

        notificationId =
          await this.notificationRepository.saveGroupNotification(
            notificationGroup,
            session,
          );
        this.logger.log('Notification save successfully');
        console.log(notificationGroup);

        if (eventsThatMakeNotificationActionsInactive_GROUP.includes(event)) {
          this.logger.log('Setting notification actions to false');
          const previousNotificationId =
            notificationGroup.getpreviousNotificationId;
          if (!previousNotificationId) {
            throw new PreviousIdMissingException();
          }
        }

        if (GROUP_NOTIFICATION_send_group.includes(event)) {
          this.logger.log('Sending new notification to group');
          await this.groupService.handleNotificationGroupAndSendToGroup(
            notificationGroup.getGroupId,
            notificationGroup.getbackData,
            event,
            session,
            notificationId as unknown as string,
          );
        }

        await this.userService.pushNotificationToUserArrayNotifications(
          notificationId,
          userNotificationOwner,
          userIdFrom,
          session,
        );
        return;
      });
      return;
    } catch (error: any) {
      this.logger.error('An error occurred while sending notification');
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
