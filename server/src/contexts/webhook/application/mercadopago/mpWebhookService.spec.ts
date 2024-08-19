// Importamos las dependencias necesarias de NestJS y otras bibliotecas.
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

// Importamos las dependencias específicas del proyecto.
import Payment from '../../domain/mercadopago/entity/payment.entity';
import MercadoPagoEventsRepositoryInterface from '../../domain/mercadopago/repository/mpEvents.repository.interface';
import { MpWebhookService } from './mpWebhook.service';
import { MyLoggerService } from '../../../shared/logger/logger.service';


describe('MpWebhookService', () => {
	let service: MpWebhookService;
	let logger: MyLoggerService;
	let configService: ConfigService;
	let mercadoPagoEventsRepository: MercadoPagoEventsRepositoryInterface;


	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MpWebhookService, // Proveemos el servicio que vamos a probar.
				{
					provide: MyLoggerService, // Proveemos un mock para el servicio de logging.
					useValue: {
						log: jest.fn(), // Mock para la función log.
						error: jest.fn(), // Mock para la función error.
					},
				},
				{
					provide: ConfigService, // Proveemos un mock para el servicio de configuración.
					useValue: {
						get: jest.fn().mockReturnValue('test_access_token'), // Mock para la función get que retorna un token de prueba.
					},
				},
				{
					provide: 'MercadoPagoEventsInterface', // Proveemos un mock para la interfaz del repositorio de eventos de MercadoPago.
					useValue: {
						createPayment: jest.fn(), // Mock para la función createPayment.
						// Otros métodos pueden ser mockeados aquí si son necesarios para otras pruebas.
					},
				},
			],
		}).compile(); // Compila el módulo de prueba.

		// Asignamos las instancias del servicio y de los mocks a variables para su uso en las pruebas.
		service = module.get<MpWebhookService>(MpWebhookService);
		logger = module.get<MyLoggerService>(MyLoggerService);
		configService = module.get<ConfigService>(ConfigService);
		mercadoPagoEventsRepository = module.get<MercadoPagoEventsRepositoryInterface>('MercadoPagoEventsInterface');
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
				},
				payment_type_id: 'credit_card',
				payment_method_id: 'visa',
				transaction_amount: 1000,
				date_approved: new Date().toString(),
			};

			await service.create_payment(payment); // Llama al método create_payment del servicio con datos válidos.

			expect(mercadoPagoEventsRepository.createPayment).toHaveBeenCalledWith(
				expect.any(Payment), // Verifica que createPayment ha sido llamado con una instancia de Payment.
			);
			expect(logger.log).toHaveBeenCalledWith('Creating payment for suscription description: Test Payment'); // Verifica que la función log ha sido llamada con el mensaje esperado.
		});

		// Test para verificar que el método create_payment lanza una excepción BadRequestException para datos de pago inválidos.
		it('should throw BadRequestException for invalid payment data', async () => {
			const invalidPayment = { id: '12345', description: 'Test Payment' }; // Datos de pago inválidos (faltan campos necesarios).

			await expect(service.create_payment(invalidPayment)).rejects.toThrow(BadRequestException); // Verifica que el método lanza una excepción BadRequestException.
			expect(logger.error).toHaveBeenCalledWith('Invalid payment data - Error in payment service'); // Verifica que la función error ha sido llamada con el mensaje de error esperado.
		});
	});


	
});
