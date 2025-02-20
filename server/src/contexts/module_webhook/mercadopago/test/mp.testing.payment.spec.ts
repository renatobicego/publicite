import { getModelToken } from "@nestjs/mongoose";
import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Models } from "mongoose";

import { MpHandlerEvents } from "../../../infastructure/adapters/handler/mpHandlerFETCHEvents";
import { SubscriptionRepository } from "../../../infastructure/repository/mp-subscription.repository";
import { PaymentDocument } from "../../../infastructure/schemas/payment.schema";

import { MpPaymentService } from "../mp-payment.service";

import { generate_payment_card_validation, get_payment } from "./models/payment.card.validation";
import mpTestingModule from "./test.module";

describe('MercadopagoService - Subscription', () => {
    let connection: Connection;

    let mpHandlerEvents: MpHandlerEvents;
    let mpPaymentService: MpPaymentService;
    let subscriptionRepository: SubscriptionRepository;


    let paymentModel: Model<PaymentDocument>


    let mockFetchToMpAdapter: any

    beforeAll(async () => {


        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();

        mpHandlerEvents = moduleRef.get<MpHandlerEvents>('MpHandlerEventsInterface');

        mpPaymentService = moduleRef.get<MpPaymentService>('MpPaymentServiceInterface');

        subscriptionRepository = moduleRef.get<SubscriptionRepository>('SubscriptionRepositoryInterface');


        paymentModel = moduleRef.get<Model<PaymentDocument>>(getModelToken('Payment'));


    });

    afterAll(async () => {
        await connection.close();
        await paymentModel.deleteMany({});
    });


    it('Create payment & get paymentByMongoId', async () => {
        const external_reference = "67420686b02bdd1f9f0ef446"
        const payment: any = get_payment("approved", external_reference);
        await mpPaymentService.createPayment(payment);


        const paymentDB = await mpPaymentService.getPaymentByMongoId(external_reference);
        console.log(paymentDB[0]);
        expect(paymentDB[0]).not.toBeNull();
        expect(paymentDB[0].descriptionOfPayment).toBe(payment.description);
        expect(paymentDB[0].mpPreapprovalId).toBe(payment.metadata.preapproval_id);
        expect(paymentDB[0].payerId).toBe(payment.payer.id);
        expect(paymentDB[0].payerEmail).toBe(payment.payer.email);
        expect(paymentDB[0].paymentTypeId).toBe(payment.payment_type_id);
        expect(paymentDB[0].paymentMethodId).toBe(payment.payment_method_id);
        expect(paymentDB[0].transactionAmount).toBe(payment.transaction_amount);
        expect(paymentDB[0].dateApproved).toBe(payment.date_approved);
        expect(paymentDB[0].external_reference).toBe(payment.external_reference);
        expect(paymentDB[0].status_detail).toBe(payment.status_detail);
        expect(paymentDB[0].status).toBe(payment.status);



    });




    it('Should return true if the payment is a payment validation (Operation Type: card_validation)', async () => {
        const payment = generate_payment_card_validation("card_validation", 100);
        const result = await mpHandlerEvents.is_a_card_validation(payment, "paymenty.created");
        expect(result).toBe(true);

    });


    it('Should return true if the payment is a payment validation (Operation is less than $30)', async () => {
        const payment = generate_payment_card_validation("", 29);
        const result = await mpHandlerEvents.is_a_card_validation(payment, "paymenty.created");
        expect(result).toBe(true);
    });

    it('Should return false if the payment is not a payment validation', async () => {
        const payment = generate_payment_card_validation("payment_recurrency", 200);
        const result = await mpHandlerEvents.is_a_card_validation(payment, "paymenty.created");
        expect(result).toBe(false);
    });







})// end