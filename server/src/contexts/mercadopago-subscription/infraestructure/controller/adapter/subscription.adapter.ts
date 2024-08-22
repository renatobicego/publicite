import { SubscriptionAdapterInterface } from "src/contexts/mercadopago-subscription/dominio/subscriptionAdapter.interface";
import { SubscriptionResponse } from "../response/subscription.response";

export class SubscriptionAdapter implements SubscriptionAdapterInterface{
	getSubscriptionByPayerId(payerId: string): Promise<SubscriptionResponse> {
		throw new Error("Method not implemented.");
	}

}