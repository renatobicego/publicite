// // Importamos las dependencias necesarias de NestJS y otras bibliotecas.
// import { BadRequestException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Test, TestingModule } from '@nestjs/testing';

// // Importamos las dependencias específicas del proyecto.
// import Payment from '../../../domain/mercadopago/entity/payment.entity';
// import MercadoPagoEventsRepositoryInterface from '../../../domain/mercadopago/repository/mp-events.repository.interface';
// import { MpWebhookService } from './mp-webhook.service';
// import { MyLoggerService } from '../../../../shared/logger/logger.service';
// import Invoice from '../../../domain/mercadopago/entity/invoice.entity';
// import { ObjectId } from 'mongoose';
// import Subscription from '../../../domain/mercadopago/entity/subcription.entity';
// import { today, getLocalTimeZone } from '@internationalized/date';

// describe('MpWebhookService', () => {
//   let service: MpWebhookService;
//   let logger: MyLoggerService;
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   let configService: ConfigService;
//   let mercadoPagoEventsRepository: MercadoPagoEventsRepositoryInterface;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         MpWebhookService, // Proveemos el servicio que vamos a probar.
//         {
//           provide: MyLoggerService, // Proveemos un mock para el servicio de logging.
//           useValue: {
//             log: jest.fn(), // Mock para la función log.
//             error: jest.fn(), // Mock para la función error.
//           },
//         },
//         {
//           provide: ConfigService, // Proveemos un mock para el servicio de configuración.
//           useValue: {
//             get: jest.fn().mockReturnValue('test_access_token'), // Mock para la función get que retorna un token de prueba.
//           },
//         },
//         {
//           provide: 'MercadoPagoEventsInterface', // Proveemos un mock para la interfaz del repositorio de eventos de MercadoPago.
//           useValue: {
//             createPayment: jest.fn(), // Mock para la función createPayment.
//             // Otros métodos pueden ser mockeados aquí si son necesarios para otras pruebas.
//           },
//         },
//       ],
//     }).compile(); // Compila el módulo de prueba.

//     // Asignamos las instancias del servicio y de los mocks a variables para su uso en las pruebas.

//     service = module.get<MpWebhookService>(MpWebhookService);
//     logger = module.get<MyLoggerService>(MyLoggerService);
//     configService = module.get<ConfigService>(ConfigService);
//     mercadoPagoEventsRepository =
//       module.get<MercadoPagoEventsRepositoryInterface>(
//         'MercadoPagoEventsInterface',
//       );
//   });

//   // verificar que el servicio está definido.
//   it('should be defined', () => {
//     expect(service).toBeDefined(); // Verifica que la instancia del servicio no sea null o undefined.
//   });

//   describe('create_payment', () => {
//     // Test para verificar que el método create_payment crea un pago exitosamente.
//     it('should create a payment successfully', async () => {
//       const payment = {
//         id: '12345',
//         description: 'Test Payment',
//         payer: {
//           id: 'payer123',
//           email: 'payer@example.com',
//           name: 'John Doe',
//           phone: '+1234567890',
//         },
//         payment_type_id: 'credit_card',
//         payment_no: 'aasdsad',
//         payment_method_id: 'visa',
//         transaction_amount: 1000,
//         date_approved: new Date().toString(),
//         currency: 'USD',
//         status: 'completed',
//         receipt_url: 'http://example.com/receipt',
//         metadata: {
//           orderId: 'order123',
//           campaignId: 'campaign456',
//         },
//         tax_amount: 50,
//         discount_amount: 10,
//       };

//       await service.create_payment(payment); // Llama al método create_payment del servicio con datos válidos.

//       expect(mercadoPagoEventsRepository.createPayment).toHaveBeenCalledWith(
//         expect.any(Payment), // Verifica que createPayment ha sido llamado con una instancia de Payment.
//       );
//       expect(logger.log).toHaveBeenCalledWith(
//         'Creating payment for suscription description: Test Payment',
//       ); // Verifica que la función log ha sido llamada con el mensaje esperado.
//     });

//     // Test para verificar que el método create_payment lanza una excepción BadRequestException para datos de pago inválidos.
//     it('should throw BadRequestException for invalid payment data', async () => {
//       const invalidPayment = { id: '12345', description: 'Test Payment' }; // Datos de pago inválidos (faltan campos necesarios).

//       await expect(service.create_payment(invalidPayment)).rejects.toThrow(
//         BadRequestException,
//       ); // Verifica que el método lanza una excepción BadRequestException.
//       expect(logger.error).toHaveBeenCalledWith(
//         'Invalid payment data - Error in payment service',
//       ); // Verifica que la función error ha sido llamada con el mensaje de error esperado.
//     });
//   });

//   describe('createSubscription_authorize_payment', () => {
//     it('should create an invoice successfully', async () => {
//       const subscription_authorized_payment = {
//         preapproval_id: '0304e9241c5c4cdc87e5e834894d954e',
//         id: 7012351430,
//         type: 'recurring',
//         status: 'processed',
//         date_created: '2024-08-22T11:17:13.042-04:00',
//         last_modified: '2024-08-22T12:07:54.041-04:00',
//         transaction_amount: 14000,
//         currency_id: 'ARS',
//         reason: 'Publicite Gold',
//         payment: {
//           id: 85924068202,
//           status: 'approved',
//           status_detail: 'accredited',
//         },
//         retry_attempt: 1,
//         next_retry_date: '2024-09-22T10:30:11.000-04:00',
//         debit_date: '2024-08-22T11:15:33.000-04:00',
//         payment_method_id: 'card',
//       };

//       // Define los objetos mock que devolverá el repositorio
//       const paymentObjectMock = {
//         _id: '66c7614b5309d7f60051c7fb' as unknown as ObjectId,
//         mpPaymentId: '85924068202',
//         payerId: '1948475212',
//         payerEmail: 'test_user_1345316664@testuser.com',
//         paymentTypeId: 'credit_card',
//         paymentMethodId: 'master',
//         transactionAmount: 14000,
//         dateApproved: '2024-08-22T12:03:16.000-04:00',
//       };

//       const subscriptionObjectMock = {
//         _id: '66c66245443429ee349a214c' as unknown as ObjectId,
//         mpPreapprovalId: '0304e9241c5c4cdc87e5e834894d954e',
//         payerId: '1948475212',
//         status: 'authorized',
//         subscriptionPlan: { $oid: '66c495f9e80296e90ec637da' },
//         startDate: '2024-08-22T10:30:10.224-04:00',
//         endDate: '2024-09-21T23:00:00.000-04:00',
//         __v: 0,
//       };

//       // Mockear los métodos de repositorio
//       const mockFindSubscriptionByPreapprovalId = jest
//         .fn()
//         .mockResolvedValue(subscriptionObjectMock);
//       const mockFindPaymentByPaymentID = jest
//         .fn()
//         .mockResolvedValue(paymentObjectMock);
//       mercadoPagoEventsRepository.findSubscriptionByPreapprovalId =
//         mockFindSubscriptionByPreapprovalId;
//       mercadoPagoEventsRepository.findPaymentByPaymentID =
//         mockFindPaymentByPaymentID;

//       // Llamar al método que estás probando
//       await service.createSubscription_authorize_payment(
//         subscription_authorized_payment,
//       );

//       // Convertir los objetos mock a instancias de clase utilizando `formatDocument`
//       const paymentInstance = Payment.fromDocument(paymentObjectMock);
//       const subscriptionInstance = Subscription.fromDocument(
//         subscriptionObjectMock,
//       );

//       // Crear la invoice utilizando los datos de los objetos convertidos
//       const newInvoice = new Invoice(
//         paymentInstance.getId(), // Payment ID desde el mock convertido
//         subscriptionInstance.getId(), // Subscription ID desde el mock convertido
//         subscription_authorized_payment.payment.status, // Payment status desde subscription_authorized_payment
//         subscription_authorized_payment.preapproval_id, // Subscription ID en MELI desde subscription_authorized_payment
//       );

//       // Imprimir la nueva invoice para verificar
//       console.log(newInvoice);

//       // Verificar que `saveInvoice` fue llamado con la nueva invoice
//       expect(mercadoPagoEventsRepository.saveInvoice).toHaveBeenCalledWith(
//         expect.objectContaining({
//           paymentId: newInvoice.getPaymentId(),
//           subscriptionId: newInvoice.getSubscriptionId(),
//           paymentStatus: newInvoice.getStatus(),
//           preapprovalId: newInvoice.getPreapprovalId(),
//         }),
//       );

//       // Verificar que las funciones de búsqueda fueron llamadas con los valores correctos
//       expect(
//         mercadoPagoEventsRepository.findSubscriptionByPreapprovalId,
//       ).toHaveBeenCalledWith(subscription_authorized_payment.preapproval_id);
//       expect(
//         mercadoPagoEventsRepository.findPaymentByPaymentID,
//       ).toHaveBeenCalledWith(subscription_authorized_payment.payment.id);
//     });
//   });

//   describe('Use parseTime to check if the time is ok', () => {
//     it('Should return short time if the parseTime  is ok', () => {
//       expect(service.parseTimeX('2024-08-22T12:03:16.000-04:00')).toBe(
//         '2024-08-22',
//       );
//     });

//     it('Should return short time if the parseTime is equal', () => {
//       expect(
//         service.parseTimeX('2024-08-22T12:03:16.000-04:00') === '2024-08-22',
//       ).toBe(true);
//     });
//     it('Should return short time if less than one day', () => {
//       expect('2024-08-21' < '2024-08-22').toBe(true);
//     });
//     it('Should return short time if more than one day and its false', () => {
//       expect('2024-08-21' > '2024-08-22').toBe(false);
//     });
//     it('Should return short time if more than one day ', () => {
//       expect('2024-08-25' > '2024-08-22').toBe(true);
//     });
//     it('Should return short time if more than one day (MONTH) ', () => {
//       expect('2024-10-25' > '2024-08-22').toBe(true);
//     });
//     it('Should return short time if more than one day (YEAR) ', () => {
//       expect('2025-08-22' > '2024-08-22').toBe(true);
//     });
//     // TEST USING TODAY
//     it('Should return short time if less than today (YEAR) ', () => {
//       const todayDate = today(getTodayDateTime()).toString();
//       expect(todayDate > '2023-08-22').toBe(true);
//     });
//     it('Should return short time if less than today (MONTH) ', () => {
//       const todayDate = today(getTodayDateTime()).toString();
//       expect(todayDate > '2024-07-22').toBe(true);
//     });
//   });
// });
