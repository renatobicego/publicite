/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import * as crypto from 'crypto';
import { mpWebhookServiceInterface } from "src/contexts/webhook/domain/mercadopago/mpWebhookServiceInterface";

/*

Cuando hago el pago recibo payment y luego recibo otro evento que se creo la subscripcion que se llama
subcription_preAppproval

cuando vuelve a pagar recibo subvcricpcon:authirizen_payment

*/
@Injectable()
export class MpWebhookAdapter {

	constructor(
		private readonly configService: ConfigService,
		// private readonly mpWebhookService: mpWebhookServiceInterface,
	) { }

	private readonly URL_PAYMENT_CHECK: string = "https://api.mercadopago.com/v1/payments/"
	private readonly URL_SUBCRIPTION_AUTHORIZED_CHECK: string = "https://api.mercadopago.com/preapproval/"
	private readonly URL_SUBCRIPTION_PREAPPROVAL_CHECK = "https://api.mercadopago.com/preapproval/"

	private readonly logger = new Logger(MpWebhookAdapter.name)
	async handleRequestWebHookOriginValidation(header: Record<string, string>, req: Request): Promise<boolean> {
		const request = req.url.split('?')[1];
		const queryObject = new URLSearchParams(request);
		const dataId = queryObject.get('data.id');

		const xSignature = header['x-signature'];
		const xRequestId = header['x-request-id'];
		if (!xSignature || !xRequestId) {
			this.logger.error("Invalid webhook headers")
			throw new UnauthorizedException('Invalid webhook headers');
		}

		// Separate x-signature into parts
		const parts = xSignature.split(',');
		let ts: string | undefined;
		let hash: string | undefined;

		// Iterate over the values to obtain ts and v1
		parts.forEach(part => {
			// Split each part into key and value
			const [key, value] = part.split('=');
			if (key && value) {
				const trimmedKey = key.trim();
				const trimmedValue = value.trim();
				if (trimmedKey === 'ts') {
					ts = trimmedValue;
				} else if (trimmedKey === 'v1') {
					hash = trimmedValue;
				}
			}
		});
		const secret = this.configService.get<string>('SECRET_KEY_MP_WEBHOOK');
		if (!secret) {
			Logger.error('Please add SECRET_KEY_MP_WEBHOOK to your environment variables');
			return Promise.resolve(false)
		}

		// Create the manifest string
		const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
		// Generate the HMAC signature
		const hmac = crypto.createHmac('sha256', secret);
		hmac.update(manifest);
		const sha = hmac.digest('hex');

		if (sha === hash) {
			this.logger.log("Webhook origin is valid, processing webhook data")
			//Si esto se cumple vamos a procesar el webhook
			try {
				const dataMeliResponse = await this.getDataFromMP(queryObject);
				console.log(dataMeliResponse)
				//una vez terminado de procesar guardaremos los datos necesarios y enviamos la notif que esta todo ok
				return Promise.resolve(true)
			} catch (error: any) {
				throw new Error(error);
			}
		} else {
			return Promise.resolve(false)
		}


	}

	async getDataFromMP(queryObject: URLSearchParams): Promise<void> {
		const MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
		const dataId = queryObject.get('data.id');
		const type = queryObject.get('type');

		if (!type || !dataId) {
			this.logger.error('Missing queryObject', 'Class:MpWebhookAdapter');
			throw new UnauthorizedException('Invalid webhook headers');
		}

		/*
		Si llegamos hasta aca quiere decir que el origen del webhook es correcto.
		-> Deberiamos chequear el tipo de evento y manejarlo segun corresponda, para la gestion del mismo vamos a llamar a nuestro servicio de webhook para meli
				Ya que es nuestra capa indicada para el manejo de la logica que corresponde a nuestro negocio y posteriormente comunicaremos con la capa de dominio para almacenar los datos
		*/
		switch (type) {
			case 'payment':
				const paymentId = queryObject.get('data.id');
				const payment = await fetch(`${this.URL_PAYMENT_CHECK}${paymentId}`,
					{
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
						}
					}
				)
				console.log("Payment - Case");
				console.log(payment);
				break;
			case 'subscription_authorized_payment':
				const preapproval_id = queryObject.get('data.preapproval_id');
				const subscription_authorized_payment = await fetch(
					`${this.URL_SUBCRIPTION_AUTHORIZED_CHECK}${preapproval_id}`,
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
						},
					},
				);
				console.log("subscription_authorized_payment - Case");
				console.log(subscription_authorized_payment);
				break;
			case 'subscription_preapproval':
				const preapproval_plan_id = queryObject.get('data.preapproval_plan_id');
				const subscription_preapproval = await fetch(
					`${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${preapproval_plan_id}`,
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
						},
					},
				);
				console.log("subscription_preapproval - Case");
				console.log(subscription_preapproval)
				break;
			default:
				throw new BadRequestException('Invalid webhook headers');
		}

	}









}