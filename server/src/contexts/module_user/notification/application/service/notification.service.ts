import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { forwardRef, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Types } from "mongoose";

import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { NotificationGroup } from "../../domain/entity/notification.group.entity";

import { NotificationGroupServiceInterface } from "../../domain/service/notification.group.service.interface";
import { eventsThatMakeActionsInactive, GROUP_NOTIFICATION_eventTypes_send_only_user, GROUP_NOTIFICATION_eventTypes_send_user_and_group, MAGAZINE_NOTIFICATION_eventTypes, memberForDeleteData, newMemberData, ownerType, typeOfNotification, user_acept_the_invitation, user_has_been_removed_fom_magazine } from "src/contexts/module_user/notification/domain/allowed-events/allowed.events.notifications";
import { GroupServiceInterface } from "src/contexts/module_group/group/domain/service/group.service.interface";
import { NotificationMagazineServiceInterface } from "../../domain/service/notification.magazine.service.interface";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { NotificationFactory } from "../notification.factory";
import { MagazineServiceInterface } from "src/contexts/module_magazine/magazine/domain/service/magazine.service.interface";
import { NotificationServiceInterface } from "../../domain/service/notification.service.interface";
import { GROUP_notification_graph_model_get_all } from "../dtos/getAll.notification.dto";




export class NotificationService implements NotificationGroupServiceInterface, NotificationMagazineServiceInterface, NotificationServiceInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @InjectConnection()
        private readonly connection: Connection,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,
        @Inject(forwardRef(() => 'GroupServiceInterface'))
        private readonly groupService: GroupServiceInterface,
        @Inject('MagazineServiceInterface')
        private readonly magazineService: MagazineServiceInterface,



    ) {

    }
    async getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<GROUP_notification_graph_model_get_all> {
        try {
            return await this.notificationRepository.getAllNotificationsFromUserById(
                id,
                limit,
                page,
            );
        } catch (error: any) {
            throw error;
        }
    }
    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationRepository.changeNotificationStatus(userRequestId, notificationId, view);

        } catch (error: any) {
            throw error;
        }
    }
    async handleMagazineNotificationAndCreateIt(notificationBody: any): Promise<void> {

        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationMagazine = factory.createNotification(typeOfNotification.magazine_notification, notificationBody);
            await this.saveNotificationMagazineAndSentToUser(notificationMagazine as NotificationMagazine);

        } catch (error: any) {
            throw error;
        }
    }


    async handleGroupNotificationAndCreateIt(notificationBody: any): Promise<void> {

        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationGroup = factory.createNotification(typeOfNotification.group_notification, notificationBody);
            await this.saveNotificationGroupAndSentToUserAndGroup(notificationGroup as NotificationGroup);

        } catch (error: any) {
            throw error;
        }
    }

    async saveNotificationGroupAndSentToUserAndGroup(notificationGroup: NotificationGroup): Promise<any> {

        const event = notificationGroup.getEvent;
        const userIdToSendNotification = notificationGroup.getUser;
        const session = await this.connection.startSession();
        let notificationId: Types.ObjectId;

        try {
            await session.withTransaction(async () => {
                this.logger.log('Saving notification....');
                notificationId = await this.notificationRepository.saveGroupNotification(notificationGroup, session);
                this.logger.log('Notification save successfully');

                if (eventsThatMakeActionsInactive.includes(event)) {
                    this.logger.log('Setting notification actions to false');
                    const previusNotificationId = notificationGroup.getPreviusNotificationId;
                    if (!previusNotificationId) {
                        throw new Error('previusNotificationId not found, please send it')
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previusNotificationId, session);
                }
                if (GROUP_NOTIFICATION_eventTypes_send_user_and_group.includes(event as any)) {
                    this.logger.log('Sending new notification to user and group');
                    await this.userService.pushNotification(notificationId, userIdToSendNotification, session);
                    await this.groupService.pushNotificationToGroup(
                        notificationId as unknown as string,
                        notificationGroup.getGroupId,
                        notificationGroup.getbackData,
                        event,
                        session,
                    );
                } else if (GROUP_NOTIFICATION_eventTypes_send_only_user.includes(event as any)) {
                    this.logger.log('Sending new notification to user');
                    await this.userService.pushNotification(notificationId, userIdToSendNotification, session);
                }
                else {
                    throw new Error(`Event type ${event} is not supported`);
                }
            });
        } catch (error: any) {
            this.logger.error('An error occurred while sending notification');
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async saveNotificationMagazineAndSentToUser(notificationMagazine: NotificationMagazine): Promise<any> {
        try {
            const event = notificationMagazine.getEvent;
            const magazineId = notificationMagazine.getFrontData.magazine._id;
            const magazineType = notificationMagazine.getFrontData.magazine.ownerType;
            const userIdToSendNotification = notificationMagazine.getUser


            const session = await this.connection.startSession();

            await session.withTransaction(async () => {
                const notificationId = await this.notificationRepository.saveMagazineNotification(notificationMagazine, session);

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

                if (eventsThatMakeActionsInactive.includes(event)) {
                    const previusNotificationId = notificationMagazine.getPreviusNotificationId;
                    if (!previusNotificationId) {
                        throw new Error('previusNotificationId not found, please send it')
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previusNotificationId, session)
                }
                await this.userService.pushNotification(notificationId, userIdToSendNotification, session);
            })



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









}