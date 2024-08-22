import {
	Body,
  Controller,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Param
} from '@nestjs/common';

import { ObjectId } from 'mongoose';
import { SubscriptionResponse } from './response/subscription.response';

const subscriptionMock : SubscriptionResponse = {
	mpPreapprovalId: 'mpPreapprovalId',
	payerId: 'payerId',
	status: 'status',
	subscriptionPlan: "66c49508e80296e90ec637d8" as unknown as ObjectId,
	startDate: 'startDate',
	endDate: 'endDate',
}

@Controller('mercadopago/subscription')
export class SubscriptionController {

	@Get(':id')
  async handleWebhookClerk(@Param() params:string): Promise<SubscriptionResponse> {
		try{

		}catch(error:any){
			throw new InternalServerErrorException(error.message)
		}
		return subscriptionMock;

  }


}