import { Injectable } from "@nestjs/common";
import { MpWebhookServiceInterface } from "../../domain/mercadopago/service/mpWebhookServiceInterface";
import { MyLoggerService } from "src/contexts/shared/logger/logger.service";
import Subcription from "../../domain/mercadopago/entity/subcription.entity";
import SubPreapprovalRepositoryInterface from "../../domain/mercadopago/repository/sub_preapproval.respository.interface";

/*

Esta capa deberia retornar todos los errores.
*/

@Injectable()
export class MpWebhookService implements MpWebhookServiceInterface {
	constructor(
		private readonly logger: MyLoggerService,
		private readonly subscriptionRepository: SubPreapprovalRepositoryInterface
	) { }
	async createSubscription_preapproval(data: any): Promise<void> {
		this.logger.log("createSubscription_preapproval - Class:mpWebhookService")
		try {
			const { id, payer_id, status, subscripcion_id } = data
			const { start_date, end_date } = data.auto_recurring
			const newUserSuscription = new Subcription(
				id,
				payer_id,
				status,
				subscripcion_id,
				start_date,
				end_date
			)
			await this.subscriptionRepository.saveSubPreapproval(newUserSuscription)
		} catch (error: any) {
			this.logger.error("Error createSubscription_preapproval - Class:mpWebhookService", error)
			throw new Error(error)
		}


	}

}

