import { ObjectId } from "mongoose";
import Invoice from "../entity/invoice.entity";
import Payment from "../entity/payment.entity";
import Subcription from "../entity/subcription.entity";
import { SubscriptionPlan } from "../entity/subscriptionPlan.entity";


export default interface MercadoPagoEventsRepositoryInterface {
	createPayment(payment: Payment): Promise<void>;
	findByPayerIdAndSubscriptionPlanID(payerId: string, subscriptionPlanID: ObjectId): Promise<Subcription | null>
	findSubscriptionPlanByMeliID(id: string): Promise<SubscriptionPlan | null>;
	findSubscriptionByPreapprovalId(id: string): Promise<Subcription | null>;
	findPaymentByPaymentID(id: string): Promise<Payment | null>;
	saveSubPreapproval(sub: Subcription): Promise<void>;
	saveInvoice(invoice: Invoice): Promise<void>;
	updateUserSubscription(payerId: string, sub: Subcription): Promise<void>;
}
