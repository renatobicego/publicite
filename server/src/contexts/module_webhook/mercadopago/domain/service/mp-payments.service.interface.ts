import Payment from '../entity/payment.entity';

export interface MpPaymentServiceInterface {
  createPayment(payment: any): Promise<void>;
  findPaymentByPaymentID(id: string): Promise<Payment | null>;
  findPaymentByClerkId(id: string): Promise<any>;
  updatePayment(payment: any): Promise<void>;
}
