import { getModelToken } from "@nestjs/mongoose";
import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model } from "mongoose";



import { generate_payment_card_validation, get_payment } from "./models/payment.creator";
import mpTestingModule from "./test.module";
import { MpPaymentService } from "../application/service/mp-payment.service";
import { MpHandlerEvents } from "../infastructure/adapters/handler/mpHandlerFETCHEvents";
import { SubscriptionRepository } from "../infastructure/repository/mp-subscription.repository";
import { PaymentDocument } from "../infastructure/schemas/payment.schema";

describe('Mercadopago - HandlerAdapter - Payment  -> CREATE', async () => {
    let connection: Connection;
    let mpHandlerEvents: MpHandlerEvents;
    let mpPaymentService: MpPaymentService;
    let subscriptionRepository: SubscriptionRepository;
    let paymentModel: Model<PaymentDocument>;
    let payment: any;
    let mockFetchToMpAdapter: any;
    connection = await mongoose.connection;


    beforeAll(async () => {
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();

        mpHandlerEvents = moduleRef.get<MpHandlerEvents>('MpHandlerEventsInterface');
        mpPaymentService = moduleRef.get<MpPaymentService>('MpPaymentServiceInterface');
        subscriptionRepository = moduleRef.get<SubscriptionRepository>('SubscriptionRepositoryInterface');
        paymentModel = moduleRef.get<Model<PaymentDocument>>(getModelToken('Payment'));



        mockFetchToMpAdapter = {
            getDataFromMp_fetch: jest.fn()
        };



        (mpHandlerEvents as any).fetchToMpAdapter = mockFetchToMpAdapter;

    });

    afterAll(async () => {
        await connection.close();

    });

    afterEach(async () => {
        await paymentModel.deleteMany({});
    });

    it('Should return true create payment if the response is not null', async () => {

        const external_reference = "67420686b02bdd1f9f0ef446"
        payment = get_payment("approved", external_reference);
        const mockedPaymentResponse = payment


        mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(mockedPaymentResponse);
        const result = await mpHandlerEvents.create_payment("123456");
        expect(result).toBe(true);


        const paymentSaved = await paymentModel.findOne({ external_reference })
        if (paymentSaved === null) throw new Error("Payment not found");
        expect(paymentSaved).not.toBeNull();
        expect(paymentSaved.descriptionOfPayment).toBe(payment.description);
        expect(paymentSaved.mpPreapprovalId).toBe(payment.metadata.preapproval_id);
        expect(paymentSaved.payerId).toBe(payment.payer.id);
        expect(paymentSaved.payerEmail).toBe(payment.payer.email);
        expect(paymentSaved.paymentTypeId).toBe(payment.payment_type_id);
        expect(paymentSaved.paymentMethodId).toBe(payment.payment_method_id);
        expect(paymentSaved.transactionAmount).toBe(payment.transaction_amount);
        expect(paymentSaved.dateApproved).toBe(payment.date_approved);
        expect(paymentSaved.external_reference).toBe(payment.external_reference);
        expect(paymentSaved.status_detail).toBe(payment.status_detail);
        expect(paymentSaved.status).toBe(payment.status);


    });

    it('Should return false and log a warning if the payment fetch is null', async () => {
        jest.spyOn(mpHandlerEvents.getLogger, 'warn');

        mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(null);
        const result = await mpHandlerEvents.create_payment("123456");

        expect(mpHandlerEvents.getLogger.warn).toHaveBeenCalledWith(
            `Fetch to mercadopago returned an empty response, please try again -> ${mpHandlerEvents.getURL_PAYMENT_CHECK}123456`
        );
        expect(result).toBe(false);

    });


    it('Should return error if the payment status is unknown', async () => {
        jest.spyOn(mpHandlerEvents.getLogger, 'error');
        mpPaymentService.createPayment = jest.fn();

        let statusOfThePayment = "test";
        const external_reference = "67420686b02bdd1f9f0ef446";
        payment = get_payment(statusOfThePayment, external_reference);
        const mockedPaymentResponse = payment;


        mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(mockedPaymentResponse);

        await expect(mpHandlerEvents.create_payment("123456")).rejects.toThrow(
            "Unknown payment CREATE status: " + statusOfThePayment
        );
        expect(mpPaymentService.createPayment).not.toHaveBeenCalled();


    });

    it('Should return true if is a card validation', async () => {
        mpPaymentService.createPayment = jest.fn();
        mockFetchToMpAdapter.is_a_card_validation = jest.fn().mockResolvedValue(true);
        (mpHandlerEvents as any).is_a_card_validation = jest.fn().mockReturnValue(true);
        const result = await mpHandlerEvents.create_payment("123456");


        expect(mpPaymentService.createPayment).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });


});


describe('MercadopagoService - Payment -> CREATE', () => {
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




describe('Mercadopago - HandlerAdapter - Payment  -> UPDATE', () => {
    let connection: Connection;
    let mpHandlerEvents: MpHandlerEvents;
    let mpPaymentService: MpPaymentService;
    let subscriptionRepository: SubscriptionRepository;
    let paymentModel: Model<PaymentDocument>;
    let payment: any;
    let mockFetchToMpAdapter: any;


    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();

        mpHandlerEvents = moduleRef.get<MpHandlerEvents>('MpHandlerEventsInterface');
        mpPaymentService = moduleRef.get<MpPaymentService>('MpPaymentServiceInterface');
        subscriptionRepository = moduleRef.get<SubscriptionRepository>('SubscriptionRepositoryInterface');
        paymentModel = moduleRef.get<Model<PaymentDocument>>(getModelToken('Payment'));



        mockFetchToMpAdapter = {
            getDataFromMp_fetch: jest.fn()
        };



        (mpHandlerEvents as any).fetchToMpAdapter = mockFetchToMpAdapter;

    });



    it('Should return true and update payment if the response is not null', async () => {
        const external_reference = "67420686b02bdd1f9f0ef448";
        const mockedPaymentResponse = get_payment("approved", external_reference);
        await paymentModel.create({
            mpPaymentId: mockedPaymentResponse.id,
            descriptionOfPayment: "Publicite premium",
            mpPreapprovalId: "8f03d95edd694438afe49d778339a832",
            payerId: "1645863715",
            payerEmail: "email.test",
            paymentTypeId: "debit_card",
            paymentMethodId: "debvisa",
            transactionAmount: 100,
            dateApproved: "null",
            external_reference: external_reference,
            status_detail: "cc_rejected_insufficient_amount",
            timeOfUpdate: "2025-01-13T16:04:18.379+00:00[UTC]",
            status: "rejected",
            __v: 0
        });



        mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(mockedPaymentResponse);
        await mpHandlerEvents.update_payment("123456");


        const paymentSaved = await paymentModel.findOne({ mpPaymentId: mockedPaymentResponse.id });
        if (paymentSaved === null) throw new Error("Payment not found");
        expect(paymentSaved).not.toBeNull();
        expect(paymentSaved.status).toBe(mockedPaymentResponse.status);
        expect(paymentSaved.status_detail).toBe(mockedPaymentResponse.status_detail);
        expect(paymentSaved.paymentTypeId).toBe(mockedPaymentResponse.payment_type_id);
        expect(paymentSaved.paymentMethodId).toBe(mockedPaymentResponse.payment_method_id);
        expect(paymentSaved.transactionAmount).toBe(mockedPaymentResponse.transaction_amount);
        expect(paymentSaved.dateApproved).toBe(mockedPaymentResponse.date_approved);

    });

    it('Should return error if the payment status is unknown', async () => {
        jest.spyOn(mpHandlerEvents.getLogger, 'error');
        mpPaymentService.updatePayment = jest.fn();

        let statusOfThePayment = "test";
        const external_reference = "67420686b02bdd1f9f0ef446";
        payment = get_payment(statusOfThePayment, external_reference);
        const mockedPaymentResponse = payment;


        mockFetchToMpAdapter.getDataFromMp_fetch.mockResolvedValue(mockedPaymentResponse);

        await expect(mpHandlerEvents.update_payment("123456")).rejects.toThrow(
            "Unknown payment CREATE status: " + statusOfThePayment
        );
        expect(mpPaymentService.updatePayment).not.toHaveBeenCalled();


    });





});


