import Payment from '../entity/payment.entity';

export interface MpPaymentServiceInterface {
  findPaymentByPaymentID(id: string): Promise<Payment | null>;
  createPayment(payment: any): Promise<void>;
  updatePayment(payment: any): Promise<void>;
}
