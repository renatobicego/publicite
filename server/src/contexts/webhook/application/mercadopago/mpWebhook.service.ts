import { Injectable } from "@nestjs/common";
import { mpWebhookServiceInterface } from "../../domain/mercadopago/mpWebhookServiceInterface";
import { dataType } from "../../domain/mercadopago/objects";


@Injectable()
export class MpWebhookService implements mpWebhookServiceInterface {
	constructor() { }


}

