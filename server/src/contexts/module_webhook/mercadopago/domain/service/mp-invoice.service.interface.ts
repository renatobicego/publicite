import Payment from "../entity/payment.entity";
import Subscription from "../entity/subcription.entity";

export interface MpServiceInvoiceInterface {
  saveInvoice(subscription_authorized_payment: any): Promise<{ payment: Payment, subscription: Subscription, paymentReady: boolean } | null>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
