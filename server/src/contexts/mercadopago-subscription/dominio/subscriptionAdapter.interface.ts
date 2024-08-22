import { SubscriptionResponse } from "../infraestructure/controller/response/subscription.response";

export interface SubscriptionAdapterInterface {
	getSubscriptionByPayerId(payerId: string): Promise<SubscriptionResponse>;
}