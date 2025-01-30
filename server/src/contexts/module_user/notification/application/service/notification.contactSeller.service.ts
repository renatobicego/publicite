import { InjectConnection } from "@nestjs/mongoose";
import { NotificationContactSeller } from "../../domain/entity/notification.contactSeller.entity";
import { NotificationContactSellerServiceInterface } from "../../domain/service/notification.contactSeller.service.interface";
import { Connection } from "mongoose";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { ContactSeller } from "src/contexts/module_user/contactSeller/domain/contactSeller.entity";
import { contact_seller_new_request } from "src/contexts/module_shared/event-emmiter/events";
import { EventEmitter2 } from "@nestjs/event-emitter";

export class NotificationContactSellerService implements NotificationContactSellerServiceInterface {


    constructor(

        @InjectConnection()
        private readonly connection: Connection,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,
        private eventEmitter: EventEmitter2,

    ) {


    }

    async createNotificationContactSellerAndSendToUser(notificationContactSeller: NotificationContactSeller): Promise<any> {
        try {
            const session = await this.connection.startSession();

            const userIdFrom = notificationContactSeller.getbackData.userIdFrom;
            const userIdTo = notificationContactSeller.getbackData.userIdTo;


            await session.withTransaction(async () => {

                //Crear schema notificacion
                const notificationId = await this.notificationRepository.saveNotificationContactSeller(notificationContactSeller, session);
                //Pushear la notificacion al array de notificaciones de usuario.
                if (!notificationId) throw new InternalServerErrorException("Error was ocurred, notificationId is null - saveNotificationContactSeller")
                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userIdTo, userIdFrom, session);
                const post = notificationContactSeller.getPostContactSeller
                const client = notificationContactSeller.getClientContactSeller
                if (!client || !post) {
                    throw new InternalServerErrorException("Error was occured CLIENT OR POST in ContactSeller are null")
                }
                const contactSellerEntity = new ContactSeller(
                    post,
                    client,
                    notificationId,
                    userIdTo
                )

                const contactSeller = await this.eventEmitter.emitAsync(
                    contact_seller_new_request,
                    contactSellerEntity
                );

                if (!contactSeller[0]) {
                    throw new InternalServerErrorException("Error was ocurred, contactSeller emiter return false. Problem with ContactSeller constructor")
                }

            })


        } catch (error: any) {
            throw error;
        }
    }

}