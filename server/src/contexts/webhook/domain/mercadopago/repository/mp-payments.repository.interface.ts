import Payment from '../entity/payment.entity';

export interface MercadoPagoPaymentsRepositoryInterface {
  findPaymentByPaymentID(id: any): Promise<Payment | null>;
  createPayment(payment: Payment): Promise<void>;
  updatePayment(paymentToUpdate: any, id: any): Promise<void>;
}
