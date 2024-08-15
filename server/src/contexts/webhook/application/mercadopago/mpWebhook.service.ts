import { Injectable } from "@nestjs/common";
import { mpWebhookServiceInterface } from "../../domain/mercadopago/mpWebhookServiceInterface";


@Injectable()
export class MpWebhookService implements mpWebhookServiceInterface {
	constructor() { }


}

