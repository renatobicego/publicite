import { InjectConnection } from "@nestjs/mongoose";
import { BadRequestException, Inject, InternalServerErrorException } from "@nestjs/common";
import { Connection } from "mongoose";


import { NotificationRequestCalificationServiceInterface } from "../../domain/service/notification.requestCalification.service.interface";
import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { NotificationPostCalification } from "../../domain/entity/notification.postCalification.entity";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { new_review, set_OpinionRequested_TRUE } from "src/contexts/module_shared/event-emmiter/events";
import { PostCalificationEnum } from "../../domain/entity/enum/postCalification.eum";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PreviousIdMissingException } from "src/contexts/module_shared/exceptionFilter/previousIdMissingException";

interface PostReview {
    post_id: string;
    author: string;
    review: string;
    date: Date;
    rating: number;
    postType: string;
}

export class NotificationRequestCalificationService implements NotificationRequestCalificationServiceInterface {


    constructor(
        @InjectConnection()
        private readonly connection: Connection,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,
        private readonly emmiter: EmitterService,
        private readonly logger: MyLoggerService

    ) {

    }




    async createNotificationAndPushToUser(notificationPostCalification: NotificationPostCalification, session: any): Promise<any> {
        this.logger.log('Creating notification and pushing to user...');
        try {
            this.validatorType(notificationPostCalification);
            const userIdFrom = notificationPostCalification.getbackData.userIdFrom;
            const userIdTo = notificationPostCalification.getbackData.userIdTo;

            //Crear la notification 
            const notificationId = await this.notificationRepository.saveRequestCalificationNotification(notificationPostCalification, session);
            if (!notificationId) throw new InternalServerErrorException("Error was ocurred, notificationId is null - saveRequestCalificationNotification")

            //Pushear la notificacion al array de notificaciones de usuario.
            await this.userService.pushNotificationToUserArrayNotifications(notificationId, userIdTo, userIdFrom, session);
            return notificationId
        } catch (error: any) {
            throw error;
        }


    }



    async createNotificationResponseCalificationAndSendToUser(notificationPostCalification: NotificationPostCalification): Promise<any> {
        this.logger.log('Creating response calification and pushing to user...');
        try {
            const session = await this.connection.startSession();
            const userIdFrom = notificationPostCalification.getbackData.userIdFrom;
            const today = new Date();
            const rating = notificationPostCalification.getRating;
            const message = notificationPostCalification.getMessageOfReview;
            const postId = notificationPostCalification.getPostId
            const postType = notificationPostCalification.getPostType;
            const previousNotificationId = notificationPostCalification.getpreviousNotificationId;

            if (!previousNotificationId) {
                throw new PreviousIdMissingException()
            }



            if (!userIdFrom || !rating || !message || !postId || !postType) {
                this.logger.log("Error was occured, userIdFrom or rating or message or postType is null")
                throw new BadRequestException("Error was occured, userIdFrom or rating or message or postType is null")
            }


            await session.withTransaction(async () => {
                await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session);
                await this.createNotificationAndPushToUser(notificationPostCalification, session);

                //Creamos la review
                const review: PostReview = {
                    post_id: postId,
                    author: userIdFrom,
                    review: message,
                    date: today,
                    rating: rating,
                    postType: postType
                }
                this.logger.log("Emmiting review")
                const reviewResponse = await this.emmiter.emitAsync(new_review, review);
                if (!reviewResponse[0]) {
                    this.logger.log("Error was occured, reviewResponse is null, check postReview constructor")
                    throw new InternalServerErrorException("Error was occured, reviewResponse is null, check postReview constructor")
                }


            })
        } catch (error: any) {
            throw error;
        }
    }



    async createNotificatioRequestCalificationAndSendToUser(notificationPostCalification: NotificationPostCalification): Promise<any> {
        const session = await this.connection.startSession();
        this.logger.log('Creating request calification and pushing to user...');
        try {
            const contactSeller_id = notificationPostCalification.getContactSellerId;

            if (!contactSeller_id) {
                this.logger.log("Error occurred, contactSeller_id is null")
                throw new InternalServerErrorException("Error occurred, contactSeller_id is null");
            }

            await session.withTransaction(async () => {
                await this.createNotificationAndPushToUser(notificationPostCalification, session);
                await this.emmiter.emitAsync(set_OpinionRequested_TRUE, contactSeller_id);
            });

        } catch (error) {
            this.logger.error("Error was occured, createNotificatioRequestCalificationAndSendToUser")
            throw error;
        } finally {
            session.endSession();
        }
    }


    private validatorType(notificationPostCalification: NotificationPostCalification): void {
        try {
            this.logger.log('Validating notification type...');
            const notificationType = notificationPostCalification.getPostCalificationType;
            const review = notificationPostCalification.getReview;
            if (notificationType === PostCalificationEnum.request && review != null) {
                this.logger.error("Error was occured, the type of notification is request and review is not null, please delete review")
                throw new BadRequestException("Error was occured, the type of notification is request and review is not null, please delete review")
            } else if (notificationType === PostCalificationEnum.response && review == null) {
                this.logger.error("Error was occured, the type of notification is response and review is null, plase send review")
                throw new BadRequestException("Error was occured, the type of notification is response and review is null, plase send review")
            }
        } catch (error: any) {
            throw error;
        }


    }
}