import { Inject, Injectable } from "@nestjs/common";
import { MpWebhookServiceInterface } from "../../domain/mercadopago/service/mpWebhookServiceInterface";
import { MyLoggerService } from "src/contexts/shared/logger/logger.service";
import Subcription from "../../domain/mercadopago/entity/subcription.entity";
import SubPreapprovalRepositoryInterface from "../../domain/mercadopago/repository/sub_preapproval.respository.interface";
import mongoose from "mongoose";

/*

Esta capa deberia retornar todos los errores.
*/

@Injectable()
export class MpWebhookService implements MpWebhookServiceInterface {
	constructor(
		private readonly logger: MyLoggerService,
		@Inject('SubPreapprovalRepositoryInterface') private readonly subscriptionRepository: SubPreapprovalRepositoryInterface

	) { }
	async createSubscription_preapproval(subscription_preapproval: any): Promise<void> {
		this.logger.log("createSubscription_preapproval - Class:mpWebhookService")
		try {
			//console.log(subscription_preapproval)
			const { id, payer_id, status, subscription_id } = subscription_preapproval
			const { start_date, end_date } = subscription_preapproval.auto_recurring

			// const subscriptionPlanId = new mongoose.Types.ObjectId(subscription_id);
			const newUserSuscription = new Subcription(
				id,
				payer_id,
				status,
				subscription_id,
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

