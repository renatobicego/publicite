import { Injectable } from "@nestjs/common";
import { mpWebhookServiceInterface } from "../../domain/mercadopago/mpWebhookServiceInterface";
import { dataType } from "../../domain/mercadopago/objects";


@Injectable()
export class MpWebhookService implements mpWebhookServiceInterface {
	constructor() { }

	processHeaders(req: any): dataType {
		const rr = req.url.split('?')[1];
		const queryObject = new URLSearchParams(rr);
		const dataId = queryObject.get('data.id');
		const type = queryObject.get('type');
		return { type: type ?? "", data: dataId ?? "" }
	}


}