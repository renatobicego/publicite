import { Injectable } from "@nestjs/common";
import { payment_notification_events_enum, PaymentDataFromMeli } from "../../../domain/entity/payment.data.meli";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { subscription_event } from "src/contexts/module_shared/event-emmiter/events";

@Injectable()
export class PaymentNotificationService {

    constructor(
        private readonly logger: MyLoggerService,
        private readonly emmiter: EmitterService
    ) { }

    get getLogger() {
        return this.logger;
    }
    get getEmmiter() {
        return this.emmiter
    }
    async sendPaymentNotification(data: any) {
        try {
            const {
                subscriptionPlanId,
                reason,
                status,
                retryAttemp,
                userId,
            } = data;

            if (!subscriptionPlanId || !reason || !status || !retryAttemp || !userId) {
                this.logger.error('One of the values is missing in the payment notification data. Payment notification not sent.')
                return true
            }

            const paymenStatusMap = new Map<string, payment_notification_events_enum>([
                ['approved', payment_notification_events_enum.payment_approved],
                ['authorized', payment_notification_events_enum.payment_approved],
                ['pending', payment_notification_events_enum.payment_pending],
                ['rejected', payment_notification_events_enum.payment_rejected],
                ['cancelled', payment_notification_events_enum.subscription_cancelled],
                ['free_trial', payment_notification_events_enum.free_trial],
            ])



            const paymentStatus = data.status;
            const event = paymenStatusMap.get(paymentStatus) ?? payment_notification_events_enum.payment_pending;

            const paymentDataFromMeli: PaymentDataFromMeli = {
                event: event,
                subscriptionPlanId: subscriptionPlanId,
                reason: reason,
                status: paymentStatus,
                retryAttemp: retryAttemp ?? 1,
                userId: userId
            }
            this.logger.log("emmiting" + event + " to user id " + userId);
            await this.emmiter.emitAsync(subscription_event, paymentDataFromMeli);
            console.log("asdasd")
        } catch (error: any) {
            throw error;
        }
    }
}
