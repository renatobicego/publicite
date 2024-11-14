import { Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { SocketNotificationServiceInterface } from '../../domain/service/socket.notification.service.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { GroupNotificatorInterface } from '../../domain/service/group.notificator.interface';
import { GROUP_NOTIFICATION_eventTypes_send_only_user, GROUP_NOTIFICATION_eventTypes_send_user_and_group, MAGAZINE_NOTIFICATION_eventTypes, ownerType } from '../../domain/allowed-events/allowed.events.notifications';
import { MagazineServiceInterface } from 'src/contexts/module_magazine/magazine/domain/service/magazine.service.interface';


interface newMemberData {
  memberToAdd: string,
  magazineAdmin: string,
  magazineId: string,
  magazineType: string
}

interface memberForDeleteData {
  memberToDelete: string,
  magazineAdmin: string,
  magazineId: string,
  magazineType: string
}


export class SocketNotificationService
  implements SocketNotificationServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('MagazineServiceInterface')
    private readonly magazineService: MagazineServiceInterface,
    @Inject('GroupNotificatorInterface')
    private readonly groupNotificator: GroupNotificatorInterface,

  ) { }

  async sendNotificationToUserAndGroup(notificationBody: any): Promise<any> {
    const event = this.verifyNotificationAndExtractEvent(notificationBody);
    if (!event) {
      this.logger.error(
        'Event not found, check your notification socket EVENT: ' + event,
      );
      return;
    }

    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        if (GROUP_NOTIFICATION_eventTypes_send_user_and_group.includes(event as any)) {
          this.logger.log('Sending new notification to user and group');
          await this.sendNotificationToUser(notificationBody, session);
          await this.groupNotificator.sendNotificationToGroup(
            notificationBody,
            event,
            session,
          );
        } else if (GROUP_NOTIFICATION_eventTypes_send_only_user.includes(event as any)) {
          this.logger.log('Sending new notification to user');
          await this.sendNotificationToUser(notificationBody);
        }
        else {
          throw new Error(`Event type ${event} is not supported`);
        }
      });
    } catch (error: any) {
      if (session) await session.abortTransaction();
      this.logger.error('An error occurred while sending notification');
      throw error;
    } finally {
      await session.endSession();
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

  async handleMagazineNotification(notificationBody: any): Promise<void> {
    try {
      const userAceptTheInvitationOfCollaborator = MAGAZINE_NOTIFICATION_eventTypes.user_acept_the_invitation
      const userHasBeenRemovedFromMagazine = MAGAZINE_NOTIFICATION_eventTypes.user_has_been_removed_fom_magazine


      const event = this.verifyNotificationAndExtractEvent(notificationBody);
      if (!event) {
        this.logger.error(
          'Event not found, check your notification socket EVENT: ' + event,
        );
        return;
      }

      if (event === userHasBeenRemovedFromMagazine) {
        const memberDeleteData = this.extractMagazineData(notificationBody, event

        )
        await this.deleteMemberFromMagazine(memberDeleteData as memberForDeleteData)

      }
      if (event === userAceptTheInvitationOfCollaborator) {
        const newMemberData = this.extractMagazineData(notificationBody, event

        )
        await this.addNewMemberToMagazine(newMemberData as newMemberData)
      }

      await this.sendNotificationToUser(notificationBody);

    } catch (error: any) {
      throw error;
    }
  }


  verifyNotificationAndExtractEvent(notificationBody: any): string {
    if (!notificationBody.notification) {
      this.logger.error(
        'Notification not found, check your notification socket',
      )
      return 'Notification not found, check your notification socket'
    }

    const { event } = notificationBody.notification;
    return event;
  }

  private extractMagazineData(notificationBody: any, event: string): newMemberData | memberForDeleteData {
    const { userIdTo, userIdFrom } = notificationBody.notification.backData
    const { _id, ownerType } = notificationBody.frontData.magazine

    if (!userIdTo || !userIdFrom || !_id) {
      this.logger.error('Invalid notification data');
      throw new Error('Invalid notification data- userIdTo, userIdFrom and _id are required');
    }

    switch (event) {
      case MAGAZINE_NOTIFICATION_eventTypes.user_acept_the_invitation:
        return { memberToAdd: userIdFrom, magazineAdmin: userIdTo, magazineId: _id, magazineType: ownerType }
      case MAGAZINE_NOTIFICATION_eventTypes.user_has_been_removed_fom_magazine:
        return { memberToDelete: userIdTo, magazineAdmin: userIdFrom, magazineId: _id, magazineType: ownerType }
      default:
        throw new Error(`Event type ${event} is not supported`);
    }


  }

  async deleteMemberFromMagazine(memberDta: memberForDeleteData) {
    const { memberToDelete, magazineAdmin, magazineId, magazineType } = memberDta
    try {
      if (ownerType.user === magazineType) {
        return await this.magazineService.deleteCollaboratorsFromMagazine([memberToDelete], magazineId, magazineAdmin)
      } else if (ownerType.group === magazineType) {
        return await this.magazineService.deleteAllowedCollaboratorsFromMagazineGroup([memberToDelete], magazineId, magazineAdmin)
      } else {
        throw new Error('Owner type (delete member) not supported in socket, please check it');
      }
    } catch (error: any) {
      throw error;
    }

  }

  async addNewMemberToMagazine(newMemberData: newMemberData) {
    const { memberToAdd, magazineAdmin, magazineId, magazineType } = newMemberData

    try {
      if (ownerType.user === magazineType) {
        return await this.magazineService.addCollaboratorsToUserMagazine([memberToAdd], magazineId, magazineAdmin)
      } else if (ownerType.group === magazineType) {
        return await this.magazineService.addAllowedCollaboratorsToGroupMagazine([memberToAdd], magazineId, magazineAdmin)
      } else {
        throw new Error('Owner type (add member)  not supported in socket, please check it');
      }
    } catch (error: any) {
      throw error;
    }
  }


}
