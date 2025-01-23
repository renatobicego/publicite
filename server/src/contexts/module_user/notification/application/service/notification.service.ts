import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { Inject } from "@nestjs/common";


import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { NotificationGroup } from "../../domain/entity/notification.group.entity";
import { NotificationGroupServiceInterface } from "../../domain/service/notification.group.service.interface";
import { NotificationMagazineServiceInterface } from "../../domain/service/notification.magazine.service.interface";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { NotificationFactory } from "../notification.factory";
import { notification_graph_model_get_all } from "../dtos/getAll.notification.dto";
import { NotificationUser } from "../../domain/entity/notification.user.entity";
import { NotModifyException } from "src/contexts/module_shared/exceptionFilter/noModifyException";
import { NotificationPostType } from "../../domain/entity/enum/notification.post.type.enum";
import { NotificationHandlerServiceInterface } from "../../domain/service/notification.handler.service.interface";
import { NotificationPostServiceInterface } from "../../domain/service/notification.post.service.interface";
import { NotificationUserServiceInterface } from "../../domain/service/notification.user.service.interface";
import { notification_group_new_user_invited, notification_magazine_new_user_invited, notification_user_new_friend_request, notification_user_new_relation_change, typeOfNotification } from "../../domain/allowed-events/allowed.events.notifications";
import { NotificationSubscriptionServiceInterface } from "../../domain/service/Notification.subscription.service.interface";





export class NotificationService implements NotificationHandlerServiceInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @Inject('NotificationMagazineServiceInterface')
        private readonly notificationMagazineService: NotificationMagazineServiceInterface,
        @Inject('NotificationGroupServiceInterface')
        private readonly notificationGroupService: NotificationGroupServiceInterface,
        @Inject('NotificationUserServiceInterface')
        private readonly notificationUserService: NotificationUserServiceInterface,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('NotificationPostServiceInterface')
        private readonly notificationPostService: NotificationPostServiceInterface,
        @Inject('NotificationSubscriptionServiceInterface')
        private readonly notificationSubscriptionService: NotificationSubscriptionServiceInterface,

    ) {

    }

    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationRepository.changeNotificationStatus(userRequestId, notificationId, view);

        } catch (error: any) {
            throw error;
        }
    }

    async getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all> {
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


    
    async isThisNotificationDuplicate(notificationEntityId: string): Promise<any> {
        try {
            const isDuplicate = await this.notificationRepository.isThisNotificationDuplicate(notificationEntityId);
            if (isDuplicate) throw new NotModifyException();
        } catch (error: any) {
            throw error;
        }
    }

    async handleMagazineNotification(notification: any): Promise<any> {
        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationMagazine = factory.createNotification(typeOfNotification.magazine_notifications, notification);
            const event = notificationMagazine.getEvent
            if (event === notification_magazine_new_user_invited) await this.isThisNotificationDuplicate(notificationMagazine.getNotificationEntityId);
            await this.notificationMagazineService.saveNotificationMagazineAndSentToUser(notificationMagazine as NotificationMagazine);

        } catch (error: any) {
            throw error;
        }
    }


    async handleGroupNotification(notification: any): Promise<void> {
        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationGroup = factory.createNotification(typeOfNotification.group_notifications, notification);
            const event = notificationGroup.getEvent
            if (event === notification_group_new_user_invited) await this.isThisNotificationDuplicate(notificationGroup.getNotificationEntityId);
            await this.notificationGroupService.saveNotificationGroupAndSentToUserAndGroup(notificationGroup as NotificationGroup);

        } catch (error: any) {
            throw error;
        }
    }
    async handlePostNotification(notification: any): Promise<void> {
        try {
            const notificationPostType = notification.frontData.postActivity.notificationPostType;
            if (!notificationPostType) {
                throw new Error("NotificationPostType is required")
            }

            const factory = NotificationFactory.getInstance(this.logger);
            let notificationPost: any = factory.createNotification(
                typeOfNotification.post_notifications,
                notification
            );

            if (notificationPost.getPostNotificationType == NotificationPostType.comment) {
                return await this.notificationPostService.saveNotificationPostCommentAndSendToUser(notificationPost)
            } else if (notificationPost.getPostNotificationType == NotificationPostType.reaction) {
                return await this.notificationPostService.saveNotificationPostReactionAndSendToUser(notificationPost);
            } else if (notificationPost.getPostNotificationType == NotificationPostType.response) {
                return await this.notificationPostService.saveNotificationPostResponseAndSendToUser(notificationPost);
            } else {
                throw new Error("NotificationPostType is not supported")
            }


        } catch (error: any) {
            throw error;
        }
    }


    async handleUserNotification(notification: any): Promise<void> {
        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationUser = factory.createNotification(typeOfNotification.user_notifications, notification);
            const event = notificationUser.getEvent
            if (event === notification_user_new_friend_request || event === notification_user_new_relation_change) {
                await this.isThisNotificationDuplicate(notificationUser.getNotificationEntityId);
            }
            await this.notificationUserService.saveNotificationUserAndSentToUser(notificationUser as NotificationUser);

        } catch (error: any) {
            throw error;
        }
    }






    async handleSubscriptionNotification(notification: any): Promise<void> {
        try {
            return await this.notificationSubscriptionService.createNotificationAndSendToUser(notification)
        } catch (error: any) {
            throw error;
        }
    }

















}