import { Inject, Injectable } from '@nestjs/common';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpHandlerEventsInterface } from 'src/contexts/webhook/domain/mercadopago/handler/eventHandler.interface';
import { MpWebhookServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mpWebhookServiceInterface';
/*
HandlerEvents de mercadopago: 
Esta clase tiene la unica responsabilidad de procesar los eventos de mercadopago, no deberiamos tener otra logica que no se encargue de procesar eventos de webhook MP.
Orquesta la logica de llamadas a la API de meli y comunica con el servicio 

*/
@Injectable()
export class MpHandlerEvents implements MpHandlerEventsInterface {

	constructor(
		private readonly logger: MyLoggerService,
		@Inject('MpWebhookServiceInterface') private readonly mpWebhookService: MpWebhookServiceInterface,
	) { }

	//Meli urls
	private readonly URL_SUBCRIPTION_PREAPPROVAL_CHECK = "https://api.mercadopago.com/preapproval/"
	private readonly URL_SUBCRIPTION_AUTHORIZED_CHECK: string = "https://api.mercadopago.com/authorized_payments/"
	private readonly URL_PAYMENT_CHECK: string = "https://api.mercadopago.com/v1/payments/"




	async handleEvent_subscription_preapproval(dataID: string): Promise<boolean> {
		try {
			const subscription_preapproval = await this.mpWebhookService.fetchData(
				`${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${dataID}`
			);
			console.log("subscription_preapproval RESPONSE:")
			console.log(subscription_preapproval);
			// const subscription_preapproval = await subscription_preapproval_response.json();
			await this.mpWebhookService.createSubscription_preapproval(subscription_preapproval);
			return Promise.resolve(true)
		} catch (error: any) {
			this.logger.error("An error has ocurred while processing subscription_preapproval event: " + error)
			throw new Error(error)
		}

	}

	async handleEvent_subscription_authorized_payment(dataID: string): Promise<boolean> {
		try {
			this.logger.log("The proccess of subscription_authorized_payment are starting - Class:mpHandlerEvents")
			const subscription_authorized_payment = await this.mpWebhookService.fetchData(
				`${this.URL_SUBCRIPTION_AUTHORIZED_CHECK}${dataID}`
			)
			console.log("subscription_authorized_payment RESPONSE:")
			console.log(subscription_authorized_payment);
			await this.mpWebhookService.createSubscription_authorize_payment(subscription_authorized_payment);
			return Promise.resolve(true)
		} catch (error: any) {
			this.logger.error("An error has ocurred while processing subscription_authorized_payment event: " + error)
			throw new Error(error)
		}
	}

	async handleEvent_payment(dataID: string, action: string): Promise<boolean> {
		this.logger.log(`The proccess of payment are starting- HANDLE_PAYMENT -> ACTION: ${action} - Class:mpHandlerEvents`)
		try {
			const paymentResponse: any = await this.mpWebhookService.fetchData(
				`${this.URL_PAYMENT_CHECK}${dataID}`
			);
			console.log("PAYMENT RESPONSE:")
			console.log(paymentResponse);


			if (action === "payment.created" && paymentResponse.operation_type === 'card_validation') {
				this.logger.log('MpWebhookAdapter - Case paymenty.created - type card_validation, sending response OK to meli & return');
				return Promise.resolve(true);
			}

			await this.mpWebhookService.create_payment(paymentResponse);
			return Promise.resolve(true)

		} catch (error: any) {
			this.logger.error("An error has ocurred while processing payment event: " + error)
			throw error;
		}



	}



}
