import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { forwardRef, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Types } from "mongoose";

import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { NotificationGroup } from "../../domain/entity/notification.group.entity";

import { NotificationGroupServiceInterface } from "../../domain/service/notification.group.service.interface";
import { eventsThatMakeNotificationActionsInactive_GROUP, eventsThatMakeNotificationActionsInactive_MAGAZINE, eventsThatMakeNotificationActionsInactive_USER, GROUP_NOTIFICATION_send_group, memberForDeleteData, newMemberData, notification_user_friend_request_accepted, notification_user_new_friend_request, notification_user_new_relation_change, ownerType, typeOfNotification, user_acept_the_invitation, user_has_been_removed_fom_magazine } from "src/contexts/module_user/notification/domain/allowed-events/allowed.events.notifications";
import { GroupServiceInterface } from "src/contexts/module_group/group/domain/service/group.service.interface";
import { NotificationMagazineServiceInterface } from "../../domain/service/notification.magazine.service.interface";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { NotificationFactory } from "../notification.factory";
import { MagazineServiceInterface } from "src/contexts/module_magazine/magazine/domain/service/magazine.service.interface";
import { NotificationServiceInterface } from "../../domain/service/notification.service.interface";
import { GROUP_notification_graph_model_get_all } from "../dtos/getAll.notification.dto";
import { NotificationUserServiceInterface } from "../../domain/service/notification.user.service.interface";
import { NotificationUser } from "../../domain/entity/notification.user.entity";




export class NotificationService implements NotificationGroupServiceInterface, NotificationMagazineServiceInterface, NotificationServiceInterface, NotificationUserServiceInterface {

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



    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationRepository.changeNotificationStatus(userRequestId, notificationId, view);

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

    async handleUserNotificationAndCreateIt(notificationBody: any): Promise<void> {

        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationUser = factory.createNotification(typeOfNotification.user_notification, notificationBody);
            await this.saveNotificationUserAndSentToUser(notificationUser as NotificationUser);

        } catch (error: any) {
            throw error;
        }
    }



    async saveNotificationGroupAndSentToUserAndGroup(notificationGroup: NotificationGroup): Promise<any> {

        const event: string = notificationGroup.getEvent;
        const userNotificationOwner = notificationGroup.getUser;
        const session = await this.connection.startSession();
        let notificationId: Types.ObjectId;

        try {


            await session.withTransaction(async () => {
                this.logger.log('Saving notification....');
                notificationId = await this.notificationRepository.saveGroupNotification(notificationGroup, session);
                this.logger.log('Notification save successfully');

                if (eventsThatMakeNotificationActionsInactive_GROUP.includes(event)) {
                    this.logger.log('Setting notification actions to false');
                    const previousNotificationId = notificationGroup.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new Error('previousNotificationId not found, please send it')
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session);
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

                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userNotificationOwner, session);
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
            const userNotificationOwner = notificationMagazine.getUser
            const session = await this.connection.startSession();

            await session.withTransaction(async () => {
                const notificationId = await this.notificationRepository.saveMagazineNotification(notificationMagazine, session);

                if (eventsThatMakeNotificationActionsInactive_MAGAZINE.includes(event)) {
                    const previousNotificationId = notificationMagazine.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new Error('previousNotificationId not found, please send it')
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


                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userNotificationOwner, session);
            })


        } catch (error: any) {
            throw error;
        }
    }

    async saveNotificationUserAndSentToUser(notificationUser: NotificationUser): Promise<any> {
        /*
        TO DO:
        1) crear y guardar la notificacion 
        2) pushear la notificacion al array de notificaciones del user
        
        Segun el evento
        1) Si el evento es una nueva solicitud de contacto, deberiamos pushear la solicitud al array de solicitudes de amistad del user
        2) Si el evento es una solicitud rechazada deberiamos sacarla del array de solicitudes de amistad del user y tambien bloquear las actions en la notificacion
        3) Si el evento es una solicitud aceptada deberiamos sacarla del array de solicitudes de amistad del user y bloquear las actions de la notificacion
        
        
        */

        try {
            const session = await this.connection.startSession();
            const event = notificationUser.getEvent;
            const userIdFrom = notificationUser.getbackData.userIdFrom;
            const userIdTo = notificationUser.getbackData.userIdTo;

            await session.withTransaction(async () => {
                const notificationId = await this.notificationRepository.saveUserNotification(notificationUser, session);

                if (eventsThatMakeNotificationActionsInactive_USER.includes(event)) {
                    const previousNotificationId = notificationUser.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new Error(`EVENT: ${event} require previousNotificationId, please send it and try again, `)
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session)
                    await this.userService.removeFriendRequest(previousNotificationId, userIdFrom, session)

                }

                if (event === notification_user_new_friend_request || event === notification_user_new_relation_change) {
                    await this.userService.pushNewFriendRequestOrRelationRequestToUser(notificationId, userIdTo, session)
                }

                if (event === notification_user_friend_request_accepted) {

                    await this.userService.makeFriendRelationBetweenUsers(notificationUser.getbackData, notificationUser.getTypeOfRelation, session)

                }

                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userIdTo, session);


            })

        } catch (error: any) {
            throw error;
        }
    }



}