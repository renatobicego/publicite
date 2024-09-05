import { ObjectId } from 'mongoose';
import Invoice from '../entity/invoice.entity';
import Payment from '../entity/payment.entity';
import { SubscriptionPlan } from '../entity/subscriptionPlan.entity';
import Subscription from '../entity/subcription.entity';

export default interface MercadoPagoEventsRepositoryInterface {
  createPayment(payment: Payment): Promise<void>;
  cancelSubscription(id: string): Promise<void>;
  findStatusOfUserSubscription(
    payerId: string,
    subscriptionPlanID: ObjectId,
    external_reference: string,
  ): Promise<Subscription | null>;
  findSubscriptionPlanByMeliID(id: string): Promise<SubscriptionPlan | null>;
  findSubscriptionByPreapprovalId(id: string): Promise<Subscription | null>;
  findPaymentByPaymentID(id: any): Promise<Payment | null>;
  findAllSubscriptions(): Promise<Subscription[]>;
  saveSubPreapproval(sub: Subscription): Promise<void>;
  saveInvoice(invoice: Invoice): Promise<void>;
  updateUserSubscription(payerId: string, sub: Subscription): Promise<void>;
}
