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


describe('MercadopagoService - Invoice', () => {
    let connection: Connection;
    let mpHandlerEvents: MpHandlerEvents;
    let invoiceModel: Model<InvoiceDocument>
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>
    let subscriptionModel: Model<SubscriptionDocument>
    let paymentModel: Model<PaymentDocument>

    let mockFetchToMpAdapter: any;
    let maockedSubscription_authorized_paymentResponse: authorized_payments
    const external_reference = "67420686b02bdd1f9f0ef446"
    const authorized_payments_id = 456;
    const mp_preapproval_id = "8f03d95edd694438afe49d778339a832"
    const subscriptionPlanId = new Types.ObjectId("66c49508e80296e90ec637d9")
    const paymentId = new Types.ObjectId("66c49508e80296e90ec637d4")
    const MP_paymentId = 123123123

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();
        mpHandlerEvents = moduleRef.get<MpHandlerEvents>('MpHandlerEventsInterface');
        mockFetchToMpAdapter = {
            getDataFromMp_fetch: jest.fn()
        };
        (mpHandlerEvents as any).fetchToMpAdapter = mockFetchToMpAdapter;
        invoiceModel = moduleRef.get<Model<InvoiceDocument>>(getModelToken('Invoice'));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken('Subscription'));
        paymentModel = moduleRef.get<Model<PaymentDocument>>(getModelToken('Payment'));
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
            MP_paymentId.toString()
        )

    });

    afterAll(async () => {
        await subscriptionPlanModel.deleteMany({});
        await subscriptionModel.deleteMany({});
        await invoiceModel.deleteMany({});
        await paymentModel.deleteMany({});
        await connection.close();

    });



    it('Mercadopago - MpHandlerEvents - subscription_authorized_payment  -> Create', async () => {
        const statusOfInvoice = "approved"
        const statusOfPayment = "approved"

        const transaction_amount = 100
        maockedSubscription_authorized_paymentResponse = get_subscription_authorized_payment(
            external_reference,
            mp_preapproval_id,
            statusOfInvoice,
            statusOfPayment,
            authorized_payments_id,
            transaction_amount,
            MP_paymentId
        )
        mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(maockedSubscription_authorized_paymentResponse);



        await mpHandlerEvents.create_subscription_authorized_payment("123")

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





    })









})// end