import { PreviousIdMissingException } from "src/contexts/module_shared/exceptionFilter/previousIdMissingException";
import { eventsThatMakeNotificationActionsInactive_MAGAZINE, memberForDeleteData, newMemberData, ownerType, user_acept_the_invitation, user_has_been_removed_fom_magazine } from "../../domain/allowed-events/allowed.events.notifications";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { NotificationMagazineServiceInterface } from "../../domain/service/notification.magazine.service.interface";
import { Inject } from "@nestjs/common";
import { MagazineServiceInterface } from "src/contexts/module_magazine/magazine/domain/service/magazine.service.interface";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";

export class NotificationMagazineService implements NotificationMagazineServiceInterface {

    constructor(

        @InjectConnection()
        private readonly connection: Connection,
        @Inject('MagazineServiceInterface')
        private readonly magazineService: MagazineServiceInterface,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,



    ) {

    }
    private async addNewMemberToMagazine(newMemberData: newMemberData, session: any) {
        const { memberToAdd, magazineAdmin, magazineId, magazineType } = newMemberData

        try {
            if (ownerType.user === magazineType) {
                return await this.magazineService.addCollaboratorsToUserMagazine([memberToAdd], magazineId, magazineAdmin, session)
            } else if (ownerType.group === magazineType) {
                return await this.magazineService.addAllowedCollaboratorsToGroupMagazine([memberToAdd], magazineId, magazineAdmin, session)
            } else {
                throw new Error('Owner type (add member)  not supported in socket, please check it');
            }
        } catch (error: any) {
            throw error;
        }
    }

    private async deleteMemberFromMagazine(memberDta: memberForDeleteData, session: any) {
        const { memberToDelete, magazineAdmin, magazineId, magazineType } = memberDta
        try {
            if (ownerType.user === magazineType) {
                return await this.magazineService.deleteCollaboratorsFromMagazine([memberToDelete], magazineId, magazineAdmin, session)
            } else if (ownerType.group === magazineType) {
                return await this.magazineService.deleteAllowedCollaboratorsFromMagazineGroup([memberToDelete], magazineId, magazineAdmin, session)
            } else {
                throw new Error('Owner type (delete member) not supported in socket, please check it');
            }
        } catch (error: any) {
            throw error;
        }

    }

    async saveNotificationMagazineAndSentToUser(notificationMagazine: NotificationMagazine): Promise<any> {
        try {
            const event = notificationMagazine.getEvent;
            const magazineId = notificationMagazine.getFrontData.magazine._id;
            const magazineType = notificationMagazine.getFrontData.magazine.ownerType;
            const userNotificationOwner = notificationMagazine.getUser
            const userIdFrom = notificationMagazine.getbackData.userIdFrom
            if (!event || !userNotificationOwner || !userIdFrom || !magazineId || !magazineType) throw new Error('Missing event, userNotificationOwner, userIdFrom, magazineId or magazineType');
            const session = await this.connection.startSession();

            await session.withTransaction(async () => {
                const notificationId = await this.notificationRepository.saveMagazineNotification(notificationMagazine, session);

                if (eventsThatMakeNotificationActionsInactive_MAGAZINE.includes(event)) {
                    const previousNotificationId = notificationMagazine.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new PreviousIdMissingException()
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session)
                }

                if (event === user_has_been_removed_fom_magazine) {

                    const memberDeleteData: memberForDeleteData = {
                        memberToDelete: notificationMagazine.getbackData.userIdTo,
                        magazineAdmin: notificationMagazine.getbackData.userIdFrom,
                        magazineId: magazineId,
                        magazineType: magazineType,
                    }

                    await this.deleteMemberFromMagazine(memberDeleteData, session)
                }
                if (event === user_acept_the_invitation) {

                    const newMemberData: newMemberData = {
                        memberToAdd: notificationMagazine.getbackData.userIdFrom,
                        magazineAdmin: notificationMagazine.getbackData.userIdTo,
                        magazineId: magazineId,
                        magazineType: magazineType
                    }

                    await this.addNewMemberToMagazine(newMemberData, session)

                }


                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userNotificationOwner, userIdFrom, session);
            })


        } catch (error: any) {
            throw error;
        }
    }
}
