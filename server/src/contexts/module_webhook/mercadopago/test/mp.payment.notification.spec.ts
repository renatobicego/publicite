import { Test, TestingModule } from "@nestjs/testing";
import { EmmiterModule } from "src/contexts/module_shared/event-emmiter/emiter.module";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PaymentNotificationService } from "../infastructure/adapters/handler/PaymentNotificationService";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { PaymentDataFromMeli, payment_notification_events_enum } from "../domain/entity/payment.data.meli";
import { LoggerModule } from "src/contexts/module_shared/logger/logger.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { subscription_event } from "src/contexts/module_shared/event-emmiter/events";



describe('PaymentNotificationService - Test', () => {
    let paymentNotification: PaymentNotificationService;
    let logger: MyLoggerService;
    let emitter: EmitterService;
    const paymenStatusMap = new Map<string, payment_notification_events_enum>([
        ['approved', payment_notification_events_enum.payment_approved],
        ['authorized', payment_notification_events_enum.payment_approved],
        ['pending', payment_notification_events_enum.payment_pending],
        ['rejected', payment_notification_events_enum.payment_rejected],
        ['cancelled', payment_notification_events_enum.subscription_cancelled],
        ['free_trial', payment_notification_events_enum.free_trial],
    ])


    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                EventEmitterModule.forRoot(
                ),
                EmmiterModule,
                LoggerModule,
            ],
            providers: [
                PaymentNotificationService,
                MyLoggerService,
                EmitterService,
            ],
        }).compile();

        paymentNotification = moduleRef.get<PaymentNotificationService>(PaymentNotificationService);
        logger = moduleRef.get<MyLoggerService>(MyLoggerService);
        emitter = moduleRef.get<EmitterService>(EmitterService);
    });


    it('should return true and logger an error if data is missing', () => {
        jest.spyOn(paymentNotification.getLogger, 'error');

        paymentNotification.sendPaymentNotification({});
        expect(paymentNotification.getLogger.error).toHaveBeenCalledWith('One of the values is missing in the payment notification data. Payment notification not sent.');

    });


    it('should log the event and emit payment data when all data is provided - Status: approved', async () => {
        const status = "approved";

        const emitterMock = jest.spyOn(paymentNotification.getEmmiter, 'emitAsync')


        const data = {
            subscriptionPlanId: "123123",
            reason: "testing",
            status: status,
            retryAttemp: "2",
            userId: "123"
        };

        const result = await paymentNotification.sendPaymentNotification(data);


        expect(emitterMock).toHaveBeenCalledWith(
            "subscription_event",
            {
                event: paymenStatusMap.get(status),
                subscriptionPlanId: "123123",
                reason: "testing",
                status: data.status,
                retryAttemp: "2",
                userId: "123"
            }

        );


        expect(result).toBeUndefined();
    });


    it('should log the event and emit payment data when all data is provided - Status: authorized', async () => {
        const status = "authorized";

        const emitterMock = jest.spyOn(paymentNotification.getEmmiter, 'emitAsync')


        const data = {
            subscriptionPlanId: "123123",
            reason: "testing",
            status: status,
            retryAttemp: "2",
            userId: "123"
        };

        const result = await paymentNotification.sendPaymentNotification(data);


        expect(emitterMock).toHaveBeenCalledWith(
            "subscription_event",
            {
                event: paymenStatusMap.get(status),
                subscriptionPlanId: "123123",
                reason: "testing",
                status: data.status,
                retryAttemp: "2",
                userId: "123"
            }

        );


        expect(result).toBeUndefined();
    });

    it('should log the event and emit payment data when all data is provided - Status: pending', async () => {
        const status = "pending";

        const emitterMock = jest.spyOn(paymentNotification.getEmmiter, 'emitAsync')


        const data = {
            subscriptionPlanId: "123123",
            reason: "testing",
            status: status,
            retryAttemp: "2",
            userId: "123"
        };

        const result = await paymentNotification.sendPaymentNotification(data);


        expect(emitterMock).toHaveBeenCalledWith(
            "subscription_event",
            {
                event: paymenStatusMap.get(status),
                subscriptionPlanId: "123123",
                reason: "testing",
                status: data.status,
                retryAttemp: "2",
                userId: "123"
            }

        );


        expect(result).toBeUndefined();
    });



    it('should log the event and emit payment data when all data is provided - Status: rejected', async () => {
        const status = "rejected";

        const emitterMock = jest.spyOn(paymentNotification.getEmmiter, 'emitAsync')


        const data = {
            subscriptionPlanId: "123123",
            reason: "testing",
            status: status,
            retryAttemp: "2",
            userId: "123"
        };

        const result = await paymentNotification.sendPaymentNotification(data);


        expect(emitterMock).toHaveBeenCalledWith(
            "subscription_event",
            {
                event: paymenStatusMap.get(status),
                subscriptionPlanId: "123123",
                reason: "testing",
                status: data.status,
                retryAttemp: "2",
                userId: "123"
            }

        );


        expect(result).toBeUndefined();
    });

    it('should log the event and emit payment data when all data is provided - Status: cancelled', async () => {
        const status = "cancelled";

        const emitterMock = jest.spyOn(paymentNotification.getEmmiter, 'emitAsync')


        const data = {
            subscriptionPlanId: "123123",
            reason: "testing",
            status: status,
            retryAttemp: "2",
            userId: "123"
        };

        const result = await paymentNotification.sendPaymentNotification(data);


        expect(emitterMock).toHaveBeenCalledWith(
            "subscription_event",
            {
                event: paymenStatusMap.get(status),
                subscriptionPlanId: "123123",
                reason: "testing",
                status: data.status,
                retryAttemp: "2",
                userId: "123"
            }

        );


        expect(result).toBeUndefined();
    });


    it('should log the event and emit payment data when all data is provided - Status: free_trial', async () => {
        const status = "free_trial";

        const emitterMock = jest.spyOn(paymentNotification.getEmmiter, 'emitAsync')


        const data = {
            subscriptionPlanId: "123123",
            reason: "testing",
            status: status,
            retryAttemp: "2",
            userId: "123"
        };

        const result = await paymentNotification.sendPaymentNotification(data);


        expect(emitterMock).toHaveBeenCalledWith(
            "subscription_event",
            {
                event: paymenStatusMap.get(status),
                subscriptionPlanId: "123123",
                reason: "testing",
                status: data.status,
                retryAttemp: "2",
                userId: "123"
            }

        );


        expect(result).toBeUndefined();
    });


});