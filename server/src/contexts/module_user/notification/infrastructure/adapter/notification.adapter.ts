import { Inject, Injectable } from "@nestjs/common";
import { NotificationAdapterInterface } from "../../domain/adapter/notification.adapter.interface";
import { NotificationServiceInterface } from "../../domain/service/notification.service.interface";
import { notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";
import { OnEvent } from "@nestjs/event-emitter";
import { downgrade_plan_contact_notification, downgrade_plan_post_notification, subscription_event } from "src/contexts/module_shared/event-emmiter/events";
import { PaymentDataFromMeli } from "../../application/dtos/payment.data.meli";
import { DOWNGRADE_PLAN_CONTACT_EVENT, DOWNGRADE_PLAN_POST_EVENT } from "../../domain/entity/downgrade.plan.events";

@Injectable()
export class NotificationAdapter implements NotificationAdapterInterface {

    constructor(
        @Inject('NotificationServiceInterface')
        private readonly notificationService: NotificationServiceInterface

    ) { }




    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationService.changeNotificationStatus(userRequestId, notificationId, view);
        } catch (error: any) {
            throw error;
        }
    }

    async deleteNotificationById(event: string, userRequestId: string, _id: string): Promise<void> {
        try {
            await this.notificationService.deleteNotificationById(event, userRequestId, _id);
        } catch (error: any) {
            throw error;
        }
    }


    async deleteAccount(id: string): Promise<any> {
        try {
            await this.notificationService.deleteAccount(id);
        } catch (error: any){
            throw error;
        }
    }


    @OnEvent(subscription_event)
    async pushPaymentSubscriptionNotification(paymentDataFromMeli: PaymentDataFromMeli): Promise<void> {
        try {
            console.log("asssasasas")
            await this.notificationService.handlePushSubscriptionNotification(paymentDataFromMeli);
        } catch (error: any) {
            throw error;
        }
    }

    @OnEvent(downgrade_plan_contact_notification)
    async downgrade_plan_contact(userId: string): Promise<void> {
        try {
            await this.notificationService.handleSubscriptionNotification(userId, DOWNGRADE_PLAN_CONTACT_EVENT)
        } catch (error: any) {
            throw error;
        }
    }


    @OnEvent(downgrade_plan_post_notification)
    async downgrade_plan_post(userId: string): Promise<void> {
        try {
            await this.notificationService.handleSubscriptionNotification(userId, DOWNGRADE_PLAN_POST_EVENT)
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
            return await this.notificationService.getAllNotificationsFromUserById(
                id,
                limit,
                page,
            );
        } catch (error: any) {
            throw error;
        }
    }



}