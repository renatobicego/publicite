import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { MpWebhookServiceInterface } from "../../domain/mercadopago/service/mpWebhookServiceInterface";
import { MyLoggerService } from "src/contexts/shared/logger/logger.service";
import Subcription from "../../domain/mercadopago/entity/subcription.entity";

import { ConfigService } from "@nestjs/config";
import Invoice from "../../domain/mercadopago/entity/invoice.entity";
import MercadoPagoEventsInterface from "../../domain/mercadopago/repository/mpEvents.repository.interface";
import Payment from "../../domain/mercadopago/entity/payment.entity";




/*
Capa de servicio: Debe encargarse de arrojar las exceptions, transforma las request en objetos de dominio (entidades) y las envia al repositorio de persistencia.
Esta capa deberia retornar todos los errores.
*/

@Injectable()
export class MpWebhookService implements MpWebhookServiceInterface {
	constructor(
		private readonly logger: MyLoggerService,
		private readonly configService: ConfigService,
		@Inject('MercadoPagoEventsInterface') private readonly mercadoPagoEventsRepository: MercadoPagoEventsInterface
	) { }
	private readonly MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');


	async create_payment(payment: any): Promise<void> {
		try {
			this.logger.log("Creating payment for suscription description: " + payment.description)
			this.logger.log("Creating payment with ID: " + payment.id)
			if (payment && payment.payer) {
				const newPayment = new Payment(
					payment.id,
					payment.payer.id,
					payment.payer.email,
					payment.payment_type_id,
					payment.payment_method_id,
					payment.transaction_amount,
					payment.date_approved
				)
				await this.mercadoPagoEventsRepository.createPayment(newPayment)
			} else {
				this.logger.error("Invalid payment data - Error in payment service")
				throw new BadRequestException("Invalid payment data")
			}

			return Promise.resolve();
		} catch (error) {
			this.logger.error("An error has ocurred while creating payment for suscription description: " + payment.description)
			this.logger.error("An error has ocurred while creating payment ID: " + payment.id)
			throw error;
		}

	}

	// Generamos la factura del usuario
	async createSubscription_authorize_payment(subscription_authorized_payment: any): Promise<void> {
		this.logger.log("createSubscription_authorize_payment - Class:mpWebhookService")
		try {
			this.logger.log("---INVOICE SERVICE---")
			if (subscription_authorized_payment.status === 'scheduled') {
				this.logger.log("Status: " + subscription_authorized_payment.status + " the invoice for subscription_authorized_payment ID: "+subscription_authorized_payment.id+ " is not saved yet. Waiting for payment to be approved")
				return Promise.resolve()
			}
			/*
			PENDIENTE: 
			si el evento es scheduled creamos el invoice y guardamos en la base de datos, pero lo hacemos con el estado en pending.
			Cuando llega el otro evento deberiamos buscar el invoice en estado pending y cambiar su estado a approved y adicionalmente updatear el schema con el ID del pago y lo que falte
			
			*/
			const subscripcion = await this.mercadoPagoEventsRepository.findSubscriptionByPreapprovalId(subscription_authorized_payment.preapproval_id)
			const payment = await this.mercadoPagoEventsRepository.findPaymentByPaymentID(subscription_authorized_payment.payment.id)


			if (!subscripcion || subscripcion === null) {
				this.logger.error("Subscription not found. An error has ocurred with subscription_authorized_payment ID: "
					+ subscription_authorized_payment.id + "- Class:mpWebhookService")
				throw new BadRequestException()
			}

			if (!payment || payment === null) {
				this.logger.error("Payment not found. An error has ocurred with the payment ID: "
					+ subscription_authorized_payment.id + "preapproval ID:" + subscription_authorized_payment.preapproval_id + "- Class:mpWebhookService")
				throw new BadRequestException()
			}
	

			if (subscription_authorized_payment != null || subscription_authorized_payment != undefined) {

				this.logger.log("Status: " + subscription_authorized_payment.status + " Generate invoice to save")
				const newInvoice = new Invoice(
					payment.getId(), //Payment ID de nuestro schema
					subscripcion.getId(), // Id de la suscripcion en nuestro schema
					subscription_authorized_payment.payment.status, //Payment status
					subscription_authorized_payment.preapproval_id // ID de la suscripcion en MELI
				)
				await this.mercadoPagoEventsRepository.saveInvoice(newInvoice)
			}
			return Promise.resolve()
		} catch (error: any) {
			this.logger.error("Error createSubscription_authorize_payment - Class:mpWebhookService", error)
			throw new InternalServerErrorException(error);
		}
	}

	// Generamos la subscripcion del usuario
	async createSubscription_preapproval(subscription_preapproval: any): Promise<void> {
		this.logger.log("---SUBSCRIPTION SERVICE---");
		this.logger.log("createSubscription_preapproval - Class: mpWebhookService");

		try {
			// Crear el nuevo objeto de suscripción
			const { id, payer_id, status, preapproval_plan_id } = subscription_preapproval;
			const { start_date, end_date } = subscription_preapproval.auto_recurring;

			const plan = await this.mercadoPagoEventsRepository.findSubscriptionPlanByMeliID(preapproval_plan_id);

			if (!plan) {
				this.logger.error("Plan not found - Class: mpWebhookService");
				throw new BadRequestException("Plan not found, we can't create the subscription");
			}

			const existingSubscription = await this.mercadoPagoEventsRepository.findByPayerIdAndSubscriptionPlanID(payer_id,
				plan.getId()
			);

			const newUserSuscription = new Subcription(
				id, // ID de la suscripción
				payer_id, // id del payer
				status, // estado de la suscripción
				plan.getId(), // id del plan en nuestro sistema
				start_date, // fecha de inicio
				end_date // fecha de fin
			)

			if (existingSubscription) {
				// Si existe una suscripción, actualízala
				this.logger.log("This payer ID already has a subscription with the same plan, updating the subscription");
				await this.mercadoPagoEventsRepository.updateUserSubscription(payer_id, newUserSuscription);
			} else {
				// Si no existe una suscripción, guárdala
				this.logger.log("This payer ID does not have a subscription, creating a new subscription");
				await this.mercadoPagoEventsRepository.saveSubPreapproval(newUserSuscription);
			}

		} catch (error) {
			this.logger.error("Error in createSubscription_preapproval - Class: mpWebhookService", error);
			throw error;
		}
	}





	async fetchData(url: string): Promise<any> {
		this.logger.log("Fetching data to Mercadopago: " + url)
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${this.MP_ACCESS_TOKEN}`,
			},
		});
		if (response.status !== 200) {
			this.logger.error(`Error fetching data: ${response.status}`);
			console.log(response)
			throw new BadRequestException('Error fetching data');
		}
		const response_result = await response.json();
		return response_result;
	}

}

