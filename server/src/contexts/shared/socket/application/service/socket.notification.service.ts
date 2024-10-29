import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SocketNotificationServiceInterface } from '../../domain/service/socket.notification.service.interface';
import { Inject } from '@nestjs/common';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';

import { GroupServiceInterface } from 'src/contexts/group/domain/service/group.service.interface';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const eventTypes = [
  'notification_group_new_user_invited', // Te han invitado a un grupo -> 0
  'notification_group_new_user_added', // Te han agregado a un grupo -> 1
  'notification_group_user_accepted', // Te han aceptado en un grupo -> 2
  'notification_group_user_rejected', // Te han rechazado en un grupo -> 3
  'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo -> 4
  'notification_group_user_request_group_invitation', // Usuario A quiere pertenecer a grupo -> 5
  'notification_group_user_removed_from_group', // Te han eliminado del grupo, -> 6
  'notification_group_user_new_admin', // Te han convertido en administrador -> 7
  'notification_group_user_removed_admin', // Te han quitado el rol de administrador -> 8
] as const;

export class SocketNotificationService
  implements SocketNotificationServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('GroupServiceInterface')
    private readonly groupService: GroupServiceInterface,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async handleEventNotification(notificationBody: any): Promise<any> {
    const { event } = notificationBody.notification;

    const session = await this.connection.startSession();

    if (!event) {
      this.logger.error(
        'Event not found, check your notification socket EVENT: ' + event,
      );
      return;
    }
    try {
      await session.withTransaction(async () => {
        switch (event) {
          case eventTypes[0]: // Te han invitado a un grupo -> 0 
          case eventTypes[1]: // Te han agregado a un grupo -> 1
          case eventTypes[2]: // Te han aceptado en un grupo -> 2
          case eventTypes[3]: // Te han rechazado en un grupo -> 3
          case eventTypes[4]: // usuario B rechazo unirse al grupo -> 4
          case eventTypes[5]: // Usuario A quiere pertenecer a grupo -> 5
            this.logger.log('Sending new notification to user and group');
            await this.sendNotificationToUser(notificationBody, session);
            await this.sendNotificationToGroup(
              notificationBody,
              event,
              session,
            );
            break;
          case eventTypes[6]: // Te han eliminado del grupo, -> 6
          case eventTypes[7]: // Te han convertido en administrador -> 7
          case eventTypes[8]: // Te han quitado el rol de administrador -> 8
            this.logger.log('Sending new notification to user');
            await this.sendNotificationToUser(notificationBody);
            break;
          default:
            throw new Error(`Event type ${event} is not supported`);
        }
      });
    } catch (error: any) {
      if (session) await session.abortTransaction();
      this.logger.error('An error occurred while sending notification');
      throw error;
    } finally {
      session.endSession();
    }
  }

  async sendNotificationToUser(notification: any, session?: any): Promise<any> {
    try {
      await this.userService.pushNotification(notification, session);
    } catch (error: any) {
      this.logger.error('An error occurred while sending notification to user');
      this.logger.error(error);
      throw error;
    }
  }

  async sendNotificationToGroup(
    notification: any,
    event: string,
    session?: any,
  ): Promise<any> {
    try {
      const { _id } = notification.frontData.group; //Id del grupo
      const { userToSendId } = notification.notification.backData;
      this.logger.log('Sending new notification to Group');
      await this.groupService.pushNotificationToGroup(
        _id,
        userToSendId,
        event,
        session,
      );
    } catch (error: any) {
      this.logger.error('An error occurred while sending notification to user');
      this.logger.error(error);
      throw error;
    }
  }
}
