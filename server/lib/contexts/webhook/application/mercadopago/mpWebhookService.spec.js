"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importamos las dependencias necesarias de NestJS y otras bibliotecas.
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const testing_1 = require("@nestjs/testing");
// Importamos las dependencias específicas del proyecto.
const payment_entity_1 = require("../../domain/mercadopago/entity/payment.entity");
const mpWebhook_service_1 = require("./mpWebhook.service");
const logger_service_1 = require("../../../shared/logger/logger.service");
const invoice_entity_1 = require("../../domain/mercadopago/entity/invoice.entity");
const subcription_entity_1 = require("../../domain/mercadopago/entity/subcription.entity");
const date_1 = require("@internationalized/date");
describe('MpWebhookService', () => {
    let service;
    let logger;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let configService;
    let mercadoPagoEventsRepository;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                mpWebhook_service_1.MpWebhookService,
                {
                    provide: logger_service_1.MyLoggerService,
                    useValue: {
                        log: jest.fn(),
                        error: jest.fn(), // Mock para la función error.
                    },
                },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test_access_token'), // Mock para la función get que retorna un token de prueba.
                    },
                },
                {
                    provide: 'MercadoPagoEventsInterface',
                    useValue: {
                        createPayment: jest.fn(), // Mock para la función createPayment.
                        // Otros métodos pueden ser mockeados aquí si son necesarios para otras pruebas.
                    },
                },
            ],
        }).compile(); // Compila el módulo de prueba.
        // Asignamos las instancias del servicio y de los mocks a variables para su uso en las pruebas.
        service = module.get(mpWebhook_service_1.MpWebhookService);
        logger = module.get(logger_service_1.MyLoggerService);
        configService = module.get(config_1.ConfigService);
        mercadoPagoEventsRepository =
            module.get('MercadoPagoEventsInterface');
    });
    // verificar que el servicio está definido.
    it('should be defined', () => {
        expect(service).toBeDefined(); // Verifica que la instancia del servicio no sea null o undefined.
    });
    describe('create_payment', () => {
        // Test para verificar que el método create_payment crea un pago exitosamente.
        it('should create a payment successfully', async () => {
            const payment = {
                id: '12345',
                description: 'Test Payment',
                payer: {
                    id: 'payer123',
                    email: 'payer@example.com',
                    name: 'John Doe',
                    phone: '+1234567890',
                },
                payment_type_id: 'credit_card',
                payment_no: 'aasdsad',
                payment_method_id: 'visa',
                transaction_amount: 1000,
                date_approved: new Date().toString(),
                currency: 'USD',
                status: 'completed',
                receipt_url: 'http://example.com/receipt',
                metadata: {
                    orderId: 'order123',
                    campaignId: 'campaign456',
                },
                tax_amount: 50,
                discount_amount: 10,
            };
            await service.create_payment(payment); // Llama al método create_payment del servicio con datos válidos.
            expect(mercadoPagoEventsRepository.createPayment).toHaveBeenCalledWith(expect.any(payment_entity_1.default));
            expect(logger.log).toHaveBeenCalledWith('Creating payment for suscription description: Test Payment'); // Verifica que la función log ha sido llamada con el mensaje esperado.
        });
        // Test para verificar que el método create_payment lanza una excepción BadRequestException para datos de pago inválidos.
        it('should throw BadRequestException for invalid payment data', async () => {
            const invalidPayment = { id: '12345', description: 'Test Payment' }; // Datos de pago inválidos (faltan campos necesarios).
            await expect(service.create_payment(invalidPayment)).rejects.toThrow(common_1.BadRequestException); // Verifica que el método lanza una excepción BadRequestException.
            expect(logger.error).toHaveBeenCalledWith('Invalid payment data - Error in payment service'); // Verifica que la función error ha sido llamada con el mensaje de error esperado.
        });
    });
    describe('createSubscription_authorize_payment', () => {
        it('should create an invoice successfully', async () => {
            const subscription_authorized_payment = {
                preapproval_id: '0304e9241c5c4cdc87e5e834894d954e',
                id: 7012351430,
                type: 'recurring',
                status: 'processed',
                date_created: '2024-08-22T11:17:13.042-04:00',
                last_modified: '2024-08-22T12:07:54.041-04:00',
                transaction_amount: 14000,
                currency_id: 'ARS',
                reason: 'Publicite Gold',
                payment: {
                    id: 85924068202,
                    status: 'approved',
                    status_detail: 'accredited',
                },
                retry_attempt: 1,
                next_retry_date: '2024-09-22T10:30:11.000-04:00',
                debit_date: '2024-08-22T11:15:33.000-04:00',
                payment_method_id: 'card',
            };
            // Define los objetos mock que devolverá el repositorio
            const paymentObjectMock = {
                _id: '66c7614b5309d7f60051c7fb',
                mpPaymentId: '85924068202',
                payerId: '1948475212',
                payerEmail: 'test_user_1345316664@testuser.com',
                paymentTypeId: 'credit_card',
                paymentMethodId: 'master',
                transactionAmount: 14000,
                dateApproved: '2024-08-22T12:03:16.000-04:00',
            };
            const subscriptionObjectMock = {
                _id: '66c66245443429ee349a214c',
                mpPreapprovalId: '0304e9241c5c4cdc87e5e834894d954e',
                payerId: '1948475212',
                status: 'authorized',
                subscriptionPlan: { $oid: '66c495f9e80296e90ec637da' },
                startDate: '2024-08-22T10:30:10.224-04:00',
                endDate: '2024-09-21T23:00:00.000-04:00',
                __v: 0,
            };
            // Mockear los métodos de repositorio
            const mockFindSubscriptionByPreapprovalId = jest
                .fn()
                .mockResolvedValue(subscriptionObjectMock);
            const mockFindPaymentByPaymentID = jest
                .fn()
                .mockResolvedValue(paymentObjectMock);
            mercadoPagoEventsRepository.findSubscriptionByPreapprovalId =
                mockFindSubscriptionByPreapprovalId;
            mercadoPagoEventsRepository.findPaymentByPaymentID =
                mockFindPaymentByPaymentID;
            // Llamar al método que estás probando
            await service.createSubscription_authorize_payment(subscription_authorized_payment);
            // Convertir los objetos mock a instancias de clase utilizando `formatDocument`
            const paymentInstance = payment_entity_1.default.fromDocument(paymentObjectMock);
            const subscriptionInstance = subcription_entity_1.default.fromDocument(subscriptionObjectMock);
            // Crear la invoice utilizando los datos de los objetos convertidos
            const newInvoice = new invoice_entity_1.default(paymentInstance.getId(), // Payment ID desde el mock convertido
            subscriptionInstance.getId(), // Subscription ID desde el mock convertido
            subscription_authorized_payment.payment.status, // Payment status desde subscription_authorized_payment
            subscription_authorized_payment.preapproval_id);
            // Imprimir la nueva invoice para verificar
            console.log(newInvoice);
            // Verificar que `saveInvoice` fue llamado con la nueva invoice
            expect(mercadoPagoEventsRepository.saveInvoice).toHaveBeenCalledWith(expect.objectContaining({
                paymentId: newInvoice.getPaymentId(),
                subscriptionId: newInvoice.getSubscriptionId(),
                paymentStatus: newInvoice.getStatus(),
                preapprovalId: newInvoice.getPreapprovalId(),
            }));
            // Verificar que las funciones de búsqueda fueron llamadas con los valores correctos
            expect(mercadoPagoEventsRepository.findSubscriptionByPreapprovalId).toHaveBeenCalledWith(subscription_authorized_payment.preapproval_id);
            expect(mercadoPagoEventsRepository.findPaymentByPaymentID).toHaveBeenCalledWith(subscription_authorized_payment.payment.id);
        });
    });
    describe('Use parseTime to check if the time is ok', () => {
        it('Should return short time if the parseTime  is ok', () => {
            expect(service.parseTimeX('2024-08-22T12:03:16.000-04:00')).toBe('2024-08-22');
        });
        it('Should return short time if the parseTime is equal', () => {
            expect(service.parseTimeX('2024-08-22T12:03:16.000-04:00') === '2024-08-22').toBe(true);
        });
        it('Should return short time if less than one day', () => {
            expect('2024-08-21' < '2024-08-22').toBe(true);
        });
        it('Should return short time if more than one day and its false', () => {
            expect('2024-08-21' > '2024-08-22').toBe(false);
        });
        it('Should return short time if more than one day ', () => {
            expect('2024-08-25' > '2024-08-22').toBe(true);
        });
        it('Should return short time if more than one day (MONTH) ', () => {
            expect('2024-10-25' > '2024-08-22').toBe(true);
        });
        it('Should return short time if more than one day (YEAR) ', () => {
            expect('2025-08-22' > '2024-08-22').toBe(true);
        });
        // TEST USING TODAY
        it('Should return short time if less than today (YEAR) ', () => {
            const todayDate = (0, date_1.today)((0, date_1.getLocalTimeZone)()).toString();
            expect(todayDate > '2023-08-22').toBe(true);
        });
        it('Should return short time if less than today (MONTH) ', () => {
            const todayDate = (0, date_1.today)((0, date_1.getLocalTimeZone)()).toString();
            expect(todayDate > '2024-07-22').toBe(true);
        });
    });
});
//# sourceMappingURL=mpWebhookService.spec.js.map