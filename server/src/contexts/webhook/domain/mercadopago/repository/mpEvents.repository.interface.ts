import { ObjectId } from "mongoose";
import Invoice from "../entity/invoice.entity";
import Payment from "../entity/payment.entity";
import { SubscriptionPlan } from "../entity/subscriptionPlan.entity";
import Subscription from "../entity/subcription.entity";



export default interface MercadoPagoEventsRepositoryInterface {
	createPayment(payment: Payment): Promise<void>;
	findByPayerIdAndSubscriptionPlanID(payerId: string, subscriptionPlanID: ObjectId): Promise<Subscription | null>
	findSubscriptionPlanByMeliID(id: string): Promise<SubscriptionPlan | null>;
	findSubscriptionByPreapprovalId(id: string): Promise<Subscription | null>;
	findPaymentByPaymentID(id: any): Promise<Payment | null>;
	saveSubPreapproval(sub: Subscription): Promise<void>;
	saveInvoice(invoice: Invoice): Promise<void>;
	updateUserSubscription(payerId: string, sub: Subscription): Promise<void>;
	findAllSubscriptions(): Promise<Subscription[]>
}
