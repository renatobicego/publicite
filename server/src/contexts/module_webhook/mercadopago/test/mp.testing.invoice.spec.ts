import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Models, Types } from "mongoose";


import mpTestingModule from "./test.module";
import { MpHandlerEvents } from "../infastructure/adapters/handler/mpHandlerFETCHEvents";
import get_subscription_authorized_payment from "./models/subscription_authorized_payment";
import { InvoiceDocument } from "../infastructure/schemas/invoice.schema";
import { getModelToken } from "@nestjs/mongoose";

import SubscriptionPlanModel, { SubscriptionPlanDocument } from "../infastructure/schemas/subscriptionPlan.schema";
import { createPlanOfSubscription, createSubscriptionForUser } from "../../../../../test/functions/create.planAndSub";
import { authorized_payments } from "../domain/entity_mp/authorized_payments";
import { SubscriptionDocument } from "../infastructure/schemas/subscription.schema";
import { PaymentDocument } from "../infastructure/schemas/payment.schema";
import createPayment from "../../../../../test/functions/createPayment";
import { MpServiceInvoiceInterface } from "../domain/service/mp-invoice.service.interface";
import { MpInvoiceService } from "../application/service/mp-invoice.service";
import { PaymentNotificationService } from "../infastructure/adapters/handler/PaymentNotificationService";
import { MpSubscriptionService } from "../application/service/mp-subscription.service";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { ErrorDocument } from "../infastructure/schemas/error.schema";



describe('MercadopagoService - Invoice   ', () => {
    let connection: Connection;
    let mpHandlerEvents: MpHandlerEvents;
    let invoiceModel: Model<InvoiceDocument>;
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>;
    let subscriptionModel: Model<SubscriptionDocument>;
    let paymentModel: Model<PaymentDocument>;
    let errorModel: Model<ErrorDocument>;


    let mockFetchToMpAdapter: any;
    let maockedSubscription_authorized_paymentResponse: authorized_payments;
    let mpInvoiceService: MpServiceInvoiceInterface;
    let paymentNotificationService: PaymentNotificationService;
    let subscriptionService: MpSubscriptionService;
    let emmiter: EmitterService;
    const external_reference = "67420686b02bdd1f9f0ef446";
    const authorized_payments_id = 456;
    const mp_preapproval_id = "8f03d95edd694438afe49d778339a832";
    const subscriptionPlanId = new Types.ObjectId("66c49508e80296e90ec637d9");
    const paymentId = new Types.ObjectId("66c49508e80296e90ec637d4");
    const mp_payment_id = 123123123;

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();

        invoiceModel = moduleRef.get<Model<InvoiceDocument>>(getModelToken('Invoice'));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken('Subscription'));
        paymentModel = moduleRef.get<Model<PaymentDocument>>(getModelToken('Payment'));
        errorModel = moduleRef.get<Model<ErrorDocument>>(getModelToken('Error'));

        emmiter = moduleRef.get<EmitterService>(EmitterService);
        subscriptionService = moduleRef.get<MpSubscriptionService>("SubscriptionServiceInterface");
        paymentNotificationService = moduleRef.get<PaymentNotificationService>(PaymentNotificationService);
        mpHandlerEvents = moduleRef.get<MpHandlerEvents>('MpHandlerEventsInterface');
        mpInvoiceService = moduleRef.get<MpInvoiceService>('MpServiceInvoiceInterface');
        mockFetchToMpAdapter = {
            getDataFromMp_fetch: jest.fn()
        };
        (mpHandlerEvents as any).fetchToMpAdapter = mockFetchToMpAdapter;
        await createPlanOfSubscription(
            subscriptionPlanId,
            subscriptionPlanModel,
            5, 5, 5,
            mp_preapproval_id,
        )
        await createSubscriptionForUser(
            subscriptionPlanId,
            external_reference,
            subscriptionPlanId,
            subscriptionModel,
            mp_preapproval_id
        )
        await createPayment(
            paymentModel,
            paymentId,
            mp_preapproval_id,
            external_reference,
            "approved",
            mp_payment_id.toString()
        )

    });

    afterAll(async () => {
        await subscriptionPlanModel.deleteMany({});
        await subscriptionModel.deleteMany({});
        await paymentModel.deleteMany({});
        await errorModel.deleteMany({})
        await connection.close();

    });

    afterEach(async () => {
        jest.clearAllMocks();
        await invoiceModel.deleteMany({});
    });

    describe('MercadopagoService - Invoice - update_plan_user function', () => {


        it('Should try 3 times if result of emmiter is false and create a new error schema', async () => {
            const event = "downgrade_plan_contact";
            const userId = "213123123";
            const errorExpected = {
                user: userId,
                code: "4545",
                message: "No se pudo actualizar el plan del usuario luego de múltiples intentos",
                result: false,
                event: event
            };
            const emitAsyncSpy = jest.spyOn(emmiter, 'emitAsync');
            emitAsyncSpy.mockResolvedValue([false]);


            await expect(mpHandlerEvents.update_plan_user(userId, event))
                .rejects.toThrow("No se pudo actualizar el plan del usuario después de múltiples intentos.");

            const errorSaved = await errorModel.findOne({ user: userId });
            expect(errorSaved).not.toBeNull();
            expect(errorSaved?.user).toBe(errorExpected.user);
            expect(errorSaved?.code).toBe(errorExpected.code);
            expect(errorSaved?.message).toBe(errorExpected.message);
            expect(errorSaved?.result).toBe("No se pudo actualizar el plan del usuario luego de múltiples intentos");
            expect(errorSaved?.event).toBe(errorExpected.event);
        });

        it('Should return true if result of emmiter is true ', async () => {
            const event = "downgrade_plan_post";
            const userId = "123";


            const emitAsyncSpy = jest.spyOn(emmiter, 'emitAsync');
            emitAsyncSpy.mockResolvedValue([true]);

            const result = await mpHandlerEvents.update_plan_user(userId, event);
            const errorSaved = await errorModel.findOne({ user: userId });
            expect(errorSaved).toBeNull();
            expect(result).toBe(true);



        })

    });

    describe('Mercadopago - MpHandlerEvents - subscription_authorized_payment', () => {


        it('Mercadopago - MpHandlerEvents - subscription_authorized_payment -> Create', async () => {
            const statusOfInvoice = "approved";
            const statusOfPayment = "approved";
            const transaction_amount = 100;


            const mockMpInvoiceService = {
                saveInvoice: jest.fn(),
            };

            const payment = {
                id: mp_payment_id,
                status: statusOfPayment,
                status_detail: "accredited"
            }
            const maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                mp_preapproval_id,
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment
            );


            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);


            const mockResultOfInvoice = {
                paymentReady: true,
                payment: { status: statusOfPayment },
                subscription: { subscriptionPlan: subscriptionPlanId },
            };
            mockMpInvoiceService.saveInvoice.mockResolvedValue(mockResultOfInvoice);



            const sendPaymentNotificationSpy = jest.spyOn(paymentNotificationService, 'sendPaymentNotification').mockImplementation(jest.fn());

            await mpHandlerEvents.create_subscription_authorized_payment("123");


            const subscription_authorized_payment_saved = await invoiceModel.findOne({ invoice_id: authorized_payments_id });
            if (subscription_authorized_payment_saved === null) throw new Error("subscription_authorized_payment_saved not found");

            expect(subscription_authorized_payment_saved).not.toBeNull();
            expect(subscription_authorized_payment_saved.paymentId).toEqual(paymentId);
            expect(subscription_authorized_payment_saved.subscriptionId).toEqual(subscriptionPlanId);
            expect(subscription_authorized_payment_saved.status).toBe(maockedSubscription_authorized_paymentResponse.status);
            expect(subscription_authorized_payment_saved.paymentStatus).toBe(maockedSubscription_authorized_paymentResponse.payment.status);
            expect(subscription_authorized_payment_saved.preapprovalId).toBe(maockedSubscription_authorized_paymentResponse.preapproval_id);
            expect(subscription_authorized_payment_saved.external_reference).toBe(maockedSubscription_authorized_paymentResponse.external_reference);
            expect(subscription_authorized_payment_saved.invoice_id).toBe(maockedSubscription_authorized_paymentResponse.id.toString());
            expect(subscription_authorized_payment_saved.transactionAmount).toBe(maockedSubscription_authorized_paymentResponse.transaction_amount);
            expect(subscription_authorized_payment_saved.currencyId).toBe(maockedSubscription_authorized_paymentResponse.currency_id);
            expect(subscription_authorized_payment_saved.reason).toBe(maockedSubscription_authorized_paymentResponse.reason);
            expect(subscription_authorized_payment_saved.nextRetryDay).toBe(maockedSubscription_authorized_paymentResponse.next_retry_date);
            expect(subscription_authorized_payment_saved.retryAttempts).toBe(maockedSubscription_authorized_paymentResponse.retry_attempt);


            const expectedData = {
                subscriptionPlanId: mockResultOfInvoice.subscription.subscriptionPlan,
                reason: maockedSubscription_authorized_paymentResponse.reason,
                status: mockResultOfInvoice.payment.status,
                retryAttemp: maockedSubscription_authorized_paymentResponse.retry_attempt,
                userId: maockedSubscription_authorized_paymentResponse.external_reference,
            };


            expect(sendPaymentNotificationSpy).toHaveBeenCalledWith(expectedData);
        });


        it('Should return true and warn logger if is a card validation', async () => {
            const loggerWarnSpy = jest.spyOn(mpHandlerEvents.getLogger, 'warn');
            const saveInvoiceSpy = jest.spyOn(mpInvoiceService, 'saveInvoice');
            const statusOfInvoice = "approved"
            const transaction_amount = 50
            const payment = {
                id: 454545456,
                status: "pending",
                status_detail: "pending"
            }
            maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                mp_preapproval_id,
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment
            )
            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);



            expect(await mpHandlerEvents.create_subscription_authorized_payment("123")).toBe(true);
            expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
            expect(loggerWarnSpy).toHaveBeenCalledWith('Payment amount is less than $50 is a card validation, returning OK to Meli');
            expect(saveInvoiceSpy).not.toHaveBeenCalled();
            loggerWarnSpy.mockRestore();

        })


        it('Should return true and not send payment Notification because payment is not ready', async () => {
            const statusOfInvoice = "scheduled";
            const transaction_amount = 100;
            const payment = {
                id: 454545456,
                status: "pending",
                status_detail: "pending"
            }

            const maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                mp_preapproval_id,
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment,

            );


            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);

            const sendPaymentNotificationSpy = jest.spyOn(paymentNotificationService, 'sendPaymentNotification').mockImplementation(jest.fn());
            await mpHandlerEvents.create_subscription_authorized_payment("123");


            const subscription_authorized_payment_saved = await invoiceModel.findOne({ invoice_id: authorized_payments_id });
            if (subscription_authorized_payment_saved === null) throw new Error("subscription_authorized_payment_saved not found");

            expect(subscription_authorized_payment_saved).not.toBeNull();
            expect(subscription_authorized_payment_saved.paymentId.toString().startsWith("0001abc")).toBe(true);
            expect(subscription_authorized_payment_saved.subscriptionId).toEqual(subscriptionPlanId);
            expect(subscription_authorized_payment_saved.status).toBe(maockedSubscription_authorized_paymentResponse.status);
            expect(subscription_authorized_payment_saved.paymentStatus).toBe(maockedSubscription_authorized_paymentResponse.payment.status);
            expect(subscription_authorized_payment_saved.preapprovalId).toBe(maockedSubscription_authorized_paymentResponse.preapproval_id);
            expect(subscription_authorized_payment_saved.external_reference).toBe(maockedSubscription_authorized_paymentResponse.external_reference);
            expect(subscription_authorized_payment_saved.invoice_id).toBe(maockedSubscription_authorized_paymentResponse.id.toString());
            expect(subscription_authorized_payment_saved.transactionAmount).toBe(maockedSubscription_authorized_paymentResponse.transaction_amount);
            expect(subscription_authorized_payment_saved.currencyId).toBe(maockedSubscription_authorized_paymentResponse.currency_id);
            expect(subscription_authorized_payment_saved.reason).toBe(maockedSubscription_authorized_paymentResponse.reason);
            expect(subscription_authorized_payment_saved.nextRetryDay).toBe(maockedSubscription_authorized_paymentResponse.next_retry_date);
            expect(subscription_authorized_payment_saved.retryAttempts).toBe(maockedSubscription_authorized_paymentResponse.retry_attempt);

            expect(sendPaymentNotificationSpy).not.toHaveBeenCalled();
        });


        it('Should return Bad Request if subscription doest not exist and invoice will not be saved', async () => {
            const statusOfInvoice = "scheduled";
            const transaction_amount = 100;
            const payment = {
                id: 454545456,
                status: "pending",
                status_detail: "pending"
            }

            const maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                "1616156165651", // mp_preapproval_id does not exist 
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment,

            );


            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);

            const sendPaymentNotificationSpy = jest.spyOn(paymentNotificationService, 'sendPaymentNotification').mockImplementation(jest.fn());


            await expect(mpHandlerEvents.create_subscription_authorized_payment("123")).rejects.toThrow("Bad Request");
            expect(sendPaymentNotificationSpy).not.toHaveBeenCalled();
        });

    })


    describe('MercadopagoService - Invoice - UPDATE METHODS ', () => {

        it('Shoul return true and warn logger if a card validation ', async () => {
            const loggerWarnSpy = jest.spyOn(mpHandlerEvents.getLogger, 'warn');
            const changeStatusOfSubscriptionSpy = jest.spyOn(subscriptionService, 'changeStatusOfSubscription');
            const verifyIfSubscriptionWasPusedSpy = jest.spyOn(subscriptionService, 'verifyIfSubscriptionWasPused');
            const updateInvoicePusedSpy = jest.spyOn(mpInvoiceService, 'updateInvoice');
            const sendPaymentNotificationSpy = jest.spyOn(paymentNotificationService, 'sendPaymentNotification');

            const statusOfInvoice = "scheduled";
            const transaction_amount = 25;
            const payment = {
                id: 454545456,
                status: "pending",
                status_detail: "pending"
            }

            const maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                "1616156165651",
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment,

            );


            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);



            expect(await mpHandlerEvents.update_subscription_authorized_payment("123")).toBe(true);
            expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
            expect(loggerWarnSpy).toHaveBeenCalledWith('Payment amount is less than $50 is a card validation, returning OK to Meli');
            expect(sendPaymentNotificationSpy).not.toHaveBeenCalled();
            expect(changeStatusOfSubscriptionSpy).not.toHaveBeenCalled();
            expect(verifyIfSubscriptionWasPusedSpy).not.toHaveBeenCalled();
            expect(updateInvoicePusedSpy).not.toHaveBeenCalled();

            loggerWarnSpy.mockRestore();

        });


        it('Status Rejected -> Should pause subscription & update invoice', async () => {
            const statusOfInvoice = "rejected";
            const authorized_payments_id = 454545456;
            const transaction_amount = 100;
            const payment = {
                id: 454545456,
                status: "rejected",
                status_detail: "pending"
            }
            await invoiceModel.create({
                paymentId: new Types.ObjectId("67ba578d7a32afe3416011fd"),
                subscriptionId: new Types.ObjectId("67ba578d7a32afe3416011fe"),
                status: statusOfInvoice,
                paymentStatus: payment.status,
                preapprovalId: mp_preapproval_id,
                external_reference: external_reference,
                invoice_id: authorized_payments_id,
                transactionAmount: transaction_amount,
                currencyId: "ARS",
                reason: "A"
            });
            const loggerWarnSpy = jest.spyOn(mpHandlerEvents.getLogger, 'warn');
            const changeStatusOfSubscriptionSpy = jest.spyOn(subscriptionService, 'changeStatusOfSubscription');
            const updateInvoicePusedSpy = jest.spyOn(mpInvoiceService, 'updateInvoice');
            const sendPaymentNotificationSpy = jest.spyOn(paymentNotificationService, 'sendPaymentNotification');
            const updatePlanUserSpy = jest.spyOn(mpHandlerEvents, 'update_plan_user');

            updatePlanUserSpy.mockResolvedValue(true);

            const maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                mp_preapproval_id,
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment,

            );


            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);


            const result = await mpHandlerEvents.update_subscription_authorized_payment("123");
            expect(result).toBe(true);

            expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
            console.log("Status rejected ")
            expect(loggerWarnSpy).toHaveBeenCalledWith(`Status is rejected, returning OK to Meli and pausing the subscription. Preapproval_id: ${maockedSubscription_authorized_paymentResponse.preapproval_id}`);

            console.log("Se llama al metodo changeStatusOfSubscription")
            expect(changeStatusOfSubscriptionSpy).toHaveBeenCalledWith(maockedSubscription_authorized_paymentResponse.preapproval_id, "paused");

            console.log("Verify invoice updated")
            const invoiceUpdated = await invoiceModel.findOne({ invoice_id: maockedSubscription_authorized_paymentResponse.id });
            if (!invoiceUpdated) throw new Error("Invoice not found")
            expect(invoiceUpdated.status).toBe(statusOfInvoice);
            expect(invoiceUpdated.paymentStatus).toBe(payment.status);
            console.log("Verify subscription updated")
            const subscripcion = await subscriptionModel.findOne({ external_reference })
            expect(subscripcion?.status).toBe("paused");

            expect(sendPaymentNotificationSpy).toHaveBeenCalledTimes(1);
            console.log("Se envia notif al usuario exitosamente")
            expect(updateInvoicePusedSpy).toHaveBeenCalled()
            expect(updatePlanUserSpy).toHaveBeenCalled()
            loggerWarnSpy.mockRestore();

        });

        it('Status Approve -> Should update subscription & invoice ', async () => {
            const statusOfInvoice = "approveed";
            const transaction_amount = 100;
            const payment = {
                id: mp_payment_id,
                status: "approved",
                status_detail: "approved"
            }
            await invoiceModel.create({
                paymentId: new Types.ObjectId("67ba578d7a32afe3416011fd"),
                subscriptionId: new Types.ObjectId("67ba578d7a32afe3416011fe"),
                status: "paused",
                paymentStatus: "rejected",
                preapprovalId: mp_preapproval_id,
                external_reference: external_reference,
                invoice_id: authorized_payments_id,
                transactionAmount: transaction_amount,
                currencyId: "ARS",
                reason: "A"
            });

            //Functions mocked
            const updateInvoicePusedSpy = jest.spyOn(mpInvoiceService, 'updateInvoice');
            const sendPaymentNotificationSpy = jest.spyOn(paymentNotificationService, 'sendPaymentNotification');
            const verifyIfSubscriptionWasPusedSpy = jest.spyOn(subscriptionService, 'verifyIfSubscriptionWasPused');
            const changesubscriptionStatusSpy = jest.spyOn(subscriptionService, 'changeStatusOfSubscription');
            sendPaymentNotificationSpy.mockResolvedValue(true);
            verifyIfSubscriptionWasPusedSpy.mockResolvedValue(true);

            const maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
                external_reference,
                mp_preapproval_id,
                statusOfInvoice,
                authorized_payments_id,
                transaction_amount,
                payment,

            );


            mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);


            const result = await mpHandlerEvents.update_subscription_authorized_payment("123");
            expect(result).toBe(true);
            expect(updateInvoicePusedSpy).toHaveBeenCalledTimes(1);
            expect(sendPaymentNotificationSpy).toHaveBeenCalledTimes(1);
            expect(changesubscriptionStatusSpy).toHaveBeenCalledTimes(1);
            const invoiceUpdated = await invoiceModel.findOne({ invoice_id: maockedSubscription_authorized_paymentResponse.id });
            if (!invoiceUpdated) throw new Error("Invoice not found")
            expect(invoiceUpdated.status).toBe(statusOfInvoice);
            expect(invoiceUpdated.paymentStatus).toBe(payment.status);


            console.log("Verify subscription updated")
            const subscripcion = await subscriptionModel.findOne({ external_reference })
            expect(subscripcion?.status).toBe("authorized");






        })
    })





})// end