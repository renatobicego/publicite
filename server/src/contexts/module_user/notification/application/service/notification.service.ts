import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { BadRequestException, Inject } from "@nestjs/common";


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
import { notification_group_new_user_invited, notification_magazine_new_user_invited, notification_new_calification_request, notification_new_calification_response, notification_new_contact, notification_user_new_friend_request, notification_user_new_relation_change, typeOfNotification } from "../../domain/allowed-events/allowed.events.notifications";
import { NotificationSubscriptionServiceInterface } from "../../domain/service/Notification.subscription.service.interface";
import { NotificationServiceInterface } from "../../domain/service/notification.service.interface";
import { NotificationContactSellerServiceInterface } from "../../domain/service/notification.contactSeller.service.interface";
import { PaymentDataFromMeli } from "../dtos/payment.data.meli";
import { NotificationPayment } from "../../domain/entity/notification.payment";
import checkIfNotificationIsValidToDelete from "../../domain/functions/checkIfNotificationIsValidToDelete";
import { NotificationRequestCalificationServiceInterface } from "../../domain/service/notification.requestCalification.service.interface";
import { NotificationPostCalification } from "../../domain/entity/notification.requestCalification.entity";
import { NotificationShareServiceInterface } from "../../domain/service/notification.share.service.interface";
import { NotificationShare } from "../../domain/entity/notification.share";
import { NotificationSubscription } from "../../domain/entity/notification.subscription.entity";





export class NotificationService implements NotificationHandlerServiceInterface, NotificationServiceInterface {


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
        @Inject('NotificationContactSellerServiceInterface')
        private readonly notificationContactSellerService: NotificationContactSellerServiceInterface,
        @Inject('NotificationRequestCalificationServiceInterface')
        private readonly notificationRequestCalificationService: NotificationRequestCalificationServiceInterface,
        @Inject('NotificationShareServiceInterface')
        private readonly notificationShareService: NotificationShareServiceInterface,

    ) {

    }





    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationRepository.changeNotificationStatus(userRequestId, notificationId, view);

        } catch (error: any) {
            throw error;
        }
    }

    async deleteNotificationById(event: string, userRequestId: string, _id: string): Promise<void> {
        try {
            const isTheNotificationValidToDelete = checkIfNotificationIsValidToDelete(event);
            if (!isTheNotificationValidToDelete) throw new BadRequestException('Notification not valid to delete');
            await this.notificationRepository.deleteNotificationById(event, userRequestId, _id);
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




    async handlePushSubscriptionNotification(paymentDataFromMeli: PaymentDataFromMeli): Promise<void> {
        try {
            const notification: any = {
                event: paymentDataFromMeli.event,
                viewed: false,
                user: paymentDataFromMeli.userId,
                backData: {
                    userIdTo: paymentDataFromMeli.userId,
                    userIdFrom: "Publicite Subscription information"
                },
                socketJobId: "This notification does not have a socketJobId",
                type: typeOfNotification.payment_notifications,
                notificationEntityId: typeOfNotification.payment_notifications,
                frontData: {
                    subscriptionPlan: {
                        _id: paymentDataFromMeli.subscriptionPlanId,
                        reason: paymentDataFromMeli.reason,
                        status: paymentDataFromMeli.status,
                        retryAttemp: paymentDataFromMeli.retryAttemp
                    }
                }
            }
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationPayment = factory.createNotification(typeOfNotification.payment_notifications, notification);

            return await this.notificationSubscriptionService.createNotificationPaymentAndSendToUser(notificationPayment as NotificationPayment)
        } catch (error: any) {
            throw error;
        }
    }

    async handleSubscriptionNotification(userId: string, event: string): Promise<void> {
        try {
            const notification: any = {
                event: event,
                viewed: false,
                user: userId,
                backData: {
                    userIdTo: userId,
                    userIdFrom: "Publicite Subscription information"
                },
                socketJobId: "This notification does not have a socketJobId",
                type: typeOfNotification.subscription_notifications,
                notificationEntityId: typeOfNotification.subscription_notifications,
                frontData: {
                    subscription: {
                        event: event
                    }
                }
            }
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationSubscription = factory.createNotification(typeOfNotification.subscription_notifications, notification);
            return await this.notificationSubscriptionService.createNotificationSubscriptionAndSendToUser(notificationSubscription as NotificationSubscription)
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



    async handleShareNotification(notification: any): Promise<void> {
        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationGroup = factory.createNotification(typeOfNotification.share_notifications, notification);
            await this.isThisNotificationDuplicate(notificationGroup.getNotificationEntityId);
            await this.notificationShareService.createNotificationShareAndSendToUser(notificationGroup as NotificationShare);

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



    async handleContactSellerNotification(notification: any): Promise<void> {
        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationContactSeller = factory.createNotification(typeOfNotification.contact_seller_notifications, notification);
            const event = notificationContactSeller.getEvent
            if (event === notification_new_contact) {
                await this.isThisNotificationDuplicate(notificationContactSeller.getNotificationEntityId);
            }
            return await this.notificationContactSellerService.createNotificationContactSellerAndSendToUser(notificationContactSeller)
        } catch (error: any) {
            throw error;
        }
    }


    async handlePostCalificationNotification(notification: any): Promise<void> {
        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationRequestCalification = factory.createNotification(typeOfNotification.post_calification_notifications, notification);
            const event = notificationRequestCalification.getEvent

            if (event === notification_new_calification_request) {
                await this.isThisNotificationDuplicate(notificationRequestCalification.getNotificationEntityId);
                return await this.notificationRequestCalificationService.createNotificatioRequestCalificationAndSendToUser(notificationRequestCalification as NotificationPostCalification)

            } else if (event === notification_new_calification_response) {

                await this.isThisNotificationDuplicate(notificationRequestCalification.getNotificationEntityId);
                return await this.notificationRequestCalificationService.createNotificationResponseCalificationAndSendToUser(notificationRequestCalification as NotificationPostCalification)

            } else {
                throw new Error("Event is not supported in handleRequestCalificationNotification")
            }

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





}