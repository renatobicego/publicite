import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { MpWebhookServiceInterface } from "../../domain/mercadopago/service/mpWebhookServiceInterface";
import { MyLoggerService } from "src/contexts/shared/logger/logger.service";
import Subcription from "../../domain/mercadopago/entity/subcription.entity";

import { ConfigService } from "@nestjs/config";
import Invoice from "../../domain/mercadopago/entity/invoice.entity";
import MercadoPagoEventsInterface from "../../domain/mercadopago/repository/mpEvents.repository.interface";



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
		console.log(payment)
		return Promise.resolve();
	}

	// Generamos la factura del usuario
	async createSubscription_authorize_payment(subscription_authorized_payment: any): Promise<void> {
		this.logger.log("createSubscription_authorize_payment - Class:mpWebhookService")
		try {
			this.logger.log("---INVOICE SERVICE---")
			if (subscription_authorized_payment.status === 'scheduled') {
				this.logger.log("Status: " + subscription_authorized_payment.status + " the invoice is not saved yet. Waiting for payment to be approved")
				return Promise.resolve()
			}
			/*
			PENDIENTE: 
			si el evento es scheduled creamos el invoice y guardamos en la base de datos, pero lo hacemos con el estado en pending.
			Cuando llega el otro evento deberiamos buscar el invoice en estado pending y cambiar su estado a approved y adicionalmente updatear el schema con el ID del pago y lo que falte
			
			*/

			if (subscription_authorized_payment != null || subscription_authorized_payment != undefined) {
				this.logger.log("Status: " + subscription_authorized_payment.status + "Generate invoice to save")
				const newInvoice = new Invoice(
					subscription_authorized_payment.payment.id, //Payment ID 
					subscription_authorized_payment.preapproval_id, // Subscription ID
					subscription_authorized_payment.payment.status, //Payment status
					subscription_authorized_payment.preapproval_id // Este campo relacionamos la suscripcion con el preapproval
				)
				await this.mercadoPagoEventsRepository.saveInvoice(newInvoice)
			}
			return Promise.resolve()
		} catch (error: any) {
			this.logger.error("Error createSubscription_authorize_payment - Class:mpWebhookService", error)
			throw error;
		}
	}

	// Generamos la subscripcion del usuario
	async createSubscription_preapproval(subscription_preapproval: any): Promise<void> {
		this.logger.log("---SUBSCRIPTION SERVICE---");
		this.logger.log("createSubscription_preapproval - Class: mpWebhookService");

		try {
			// Buscar la suscripción existente por payerId
			const existingSubscription = await this.mercadoPagoEventsRepository.findByPayerId(subscription_preapproval.payer_id);

			// Crear el nuevo objeto de suscripción
			const { id, payer_id, status, subscription_id } = subscription_preapproval;
			const { start_date, end_date } = subscription_preapproval.auto_recurring;

			const newUserSuscription = new Subcription(
				id,
				payer_id,
				status,
				subscription_id,
				start_date,
				end_date
			)

			if (existingSubscription) {
				// Si existe una suscripción, actualízala
				this.logger.log("This payer ID already has a subscription, updating the subscription");
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

