import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import * as crypto from 'crypto';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpWebhookServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mpWebhookServiceInterface';

/*

Cuando hago el pago recibo payment y luego recibo otro evento que se creo la subscripcion que se llama
subcription_preAppproval

cuando vuelve a pagar recibo subvcricpcon:authirizen_payment

*/
@Injectable()
export class MpWebhookAdapter {

	constructor(
		private readonly configService: ConfigService,
		private readonly mpWebhookService: MpWebhookServiceInterface,
		private readonly logger : MyLoggerService
	) { }


	private readonly URL_PAYMENT_CHECK: string = "https://api.mercadopago.com/v1/payments/"
	private readonly URL_SUBCRIPTION_AUTHORIZED_CHECK: string = "https://api.mercadopago.com/preapproval/"
	private readonly URL_SUBCRIPTION_PREAPPROVAL_CHECK = "https://api.mercadopago.com/preapproval/"

	private readonly MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');


	async handleRequestWebHookOriginValidation(header: Record<string, string>, req: Request): Promise<boolean> {
		const request = req.url.split('?')[1];
		const queryObject = new URLSearchParams(request);
		const { body } = req;
		const dataId = queryObject.get('data.id');

		const xSignature = header['x-signature'];
		const xRequestId = header['x-request-id'];
		if (!xSignature || !xRequestId) {
			this.logger.error('Invalid webhook headers');
			throw new UnauthorizedException('Invalid webhook headers');
		}

		const validation = this.checkHashValidation(xSignature, xRequestId, dataId ?? "");

		if (validation) {
			this.logger.log("Webhook origin is valid, processing webhook data")
			//Si esto se cumple vamos a procesar el webhook
			try {
				const validationGetMp = await this.getDataFromMP(body);
				if (validationGetMp) {
					return Promise.resolve(true)
				} else {
					return Promise.resolve(false)
				}
				//una vez terminado de procesar guardaremos los datos necesarios y enviamos la notif que esta todo ok

			} catch (error: any) {
				throw new Error(error);
			}
		} else {
			return Promise.resolve(false)
		}
	}


	checkHashValidation(xSignature: string, xRequestId: string, dataId: string) {
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
			this.logger.error('Please add SECRET_KEY_MP_WEBHOOK to your environment variables');
			return Promise.resolve(false)
		}

		// Create the manifest string
		const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
		// Generate the HMAC signature
		const hmac = crypto.createHmac('sha256', secret);
		hmac.update(manifest);
		const sha = hmac.digest('hex');
		if (sha === hash) {
			return true
		} else {
			return false
		}
	}

	async getDataFromMP(body: any): Promise<boolean> {
		this.logger.log("Getting data from MP")

		const dataId = body.data.id;
		const type = body.type;

		if (!type || !dataId) {
			this.logger.error('Missing queryObject', 'Class:MpWebhookAdapter');
			throw new UnauthorizedException('Invalid webhook headers');
		}

		/*
		Si llegamos hasta aca quiere decir que el origen del webhook es correcto.
		-> Deberiamos chequear el tipo de evento y manejarlo segun corresponda, para la gestion del mismo vamos a llamar a nuestro servicio de webhook para meli
				Ya que es nuestra capa indicada para el manejo de la logica que corresponde a nuestro negocio y posteriormente comunicaremos con la capa de dominio para almacenar los datos
		*/
		const action = body.action;
		//console.log(action, type);


		//Verificamos que el evento sea de tipo card_validation, en ese caso devolvemos la promesa en true ya que no nos interesa.
		if (action === "payment.created" && body.operation_type === 'card_validation' && body.transaction_amount < 1000) {
			this.logger.log('MpWebhookAdapter - Case paymenty.created - type card_validation, sending response OK to meli & return');
			return Promise.resolve(true);
		}

		switch (type) {
			case 'payment':
				const payment = await fetch(`${this.URL_PAYMENT_CHECK}${dataId}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${this.MP_ACCESS_TOKEN}`,
					},
				});
				console.log('Payment - Case', action);
				console.log(await payment.json());
				break;
			case 'subscription_authorized_payment':
				const subscription_authorized_payment = await fetch(
					`${this.URL_SUBCRIPTION_AUTHORIZED_CHECK}${dataId}`,
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${this.MP_ACCESS_TOKEN}`,
						},
					},
				);
				console.log('subscription_authorized_payment - Case', action);
				console.log(await subscription_authorized_payment.json());
				break;
			case 'subscription_preapproval':
				this.logger.log("processing subscription_preapproval Case - Action: " + action)
				const response = await this.handleEvent_subscription_preapproval(dataId);
				if (response) return Promise.resolve(true)
				break;
			default:
				throw new BadRequestException('Invalid webhook headers');
		}
		return Promise.resolve(true);
	}


	async handleEvent_subscription_preapproval(dataID: string): Promise<boolean> {

		try {
			const subscription_preapproval_response = await fetch(
				`${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${dataID}`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${this.MP_ACCESS_TOKEN}`,
					},
				},
			);

			//Si por alguna razon la peticion falla, retornamos false y hacemos que el controller tambien lo haga
			//De esta manera le decimos a MP que hubo algun problem (entiendo que quizas si no retornamos 200 manda la peticion de nuevo)
			if (subscription_preapproval_response.status !== 200) {
				this.logger.error(`Error fetching subscription_preapproval data: ${subscription_preapproval_response.status}`);
				return Promise.resolve(false)
			}
			console.log(await subscription_preapproval_response.json());
			/*
			En el caso de que esta peticion se complete de manera correcta 
			vamos a llamar al servicio para almacenar la informacion en la base de datos 8=D
			*/
			await this.mpWebhookService.createSubscription_preapproval(subscription_preapproval_response);

		}catch(error:any){
			this.logger.error("An error has ocurred while processing subscription_preapproval event: " + error)
			throw new Error(error)
		}

		return Promise.resolve(false)

	}



}