import { ObjectId } from "mongoose";
import Invoice from "../entity/invoice.entity";
import Payment from "../entity/payment.entity";
import Subcription from "../entity/subcription.entity";
import { SubscriptionPlan } from "../entity/subscriptionPlan.entity";


export default interface MercadoPagoEventsRepositoryInterface {
	saveSubPreapproval(sub: Subcription): Promise<void>;
	saveInvoice(invoice: Invoice): Promise<void>;
	updateUserSubscription(payerId: string, sub: Subcription): Promise<void>;
	findByPayerIdAndSubscriptionPlanID(payerId: string, subscriptionPlanID: ObjectId): Promise<Subcription | null>
	findSubscriptionPlanByMeliID(id: string): Promise<SubscriptionPlan | null>;
	createPayment(payment: Payment): Promise<void>;
}
