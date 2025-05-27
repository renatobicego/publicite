import { InjectConnection } from '@nestjs/mongoose';
import { NotificationUserServiceInterface } from '../../domain/service/notification.user.service.interface';
import { Connection } from 'mongoose';
import { Inject } from '@nestjs/common';
import { NotificationRepositoryInterface } from '../../domain/repository/notification.repository.interface';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { NotificationUser } from '../../domain/entity/notification.user.entity';
import {
  eventsThatMakeNotificationActionsInactive_USER,
  notification_user_friend_request_accepted,
  notification_user_new_friend_request,
  notification_user_new_relation_accepted,
  notification_user_new_relation_change,
} from '../../domain/allowed-events/allowed.events.notifications';
import { PreviousIdMissingException } from 'src/contexts/module_shared/exceptionFilter/previousIdMissingException';

export class NotificationUserService
  implements NotificationUserServiceInterface
{
  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @Inject('NotificationRepositoryInterface')
    private readonly notificationRepository: NotificationRepositoryInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) {}
  async saveNotificationUserAndSentToUser(
    notificationUser: NotificationUser,
  ): Promise<any> {
    try {
      const session = await this.connection.startSession();
      const event = notificationUser.getEvent;
      const userIdFrom = notificationUser.getbackData.userIdFrom;
      const userIdTo = notificationUser.getbackData.userIdTo;
      const backData = notificationUser.getbackData;

      if (!event || !userIdFrom || !userIdTo)
        throw new Error('Missing event, userIdFrom, userIdTo');
      await session.withTransaction(async () => {
        if (event === notification_user_friend_request_accepted) {
          const userRelationId =
            await this.userService.makeFriendRelationBetweenUsers(
              notificationUser.getbackData,
              notificationUser.getTypeOfRelation,
              session,
            );
          if (!userRelationId)
            throw new Error(
              `Error was ocurred when making friend relation between users, please try again`,
            );
          notificationUser.setNotificationUserRelationId = userRelationId;
        }

        if (event === notification_user_new_relation_accepted) {
          const userRelationId =
            notificationUser.getUserRelationId ?? undefined;
          if (!userRelationId) {
            throw new Error(
              `EVENT: ${event} require userRelationId, please send it and try again, `,
            );
          }
          await this.userService.updateFriendRelationOfUsers(
            userRelationId,
            notificationUser.getTypeOfRelation,
            session,
          );
        }

        const notificationId =
          await this.notificationRepository.saveUserNotification(
            notificationUser,
            session,
          );

        if (
          event === notification_user_new_friend_request ||
          event === notification_user_new_relation_change
        ) {
          await this.userService.pushNewFriendRequestOrRelationRequestToUser(
            notificationId,
            backData,
            session,
          );
        }

        if (eventsThatMakeNotificationActionsInactive_USER.includes(event)) {
          const previousNotificationId =
            notificationUser.getpreviousNotificationId;
          if (!previousNotificationId) {
            throw new PreviousIdMissingException();
          }
          await this.notificationRepository.setNotificationActionsToFalseById(
            previousNotificationId,
            session,
          );
          await this.userService.removeFriendRequest(
            previousNotificationId,
            backData,
            session,
          );
        }

        await this.userService.pushNotificationToUserArrayNotifications(
          notificationId,
          userIdTo,
          userIdFrom,
          session,
        );
      });
    } catch (error: any) {
      throw error;
    }
  }
}
