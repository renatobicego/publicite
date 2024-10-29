import { PaymentResponse } from 'src/contexts/module_webhook/application/mercadopago/adapter/HTTP-RESPONSE/payment.response';
import Payment from '../entity/payment.entity';

export interface MercadoPagoPaymentsRepositoryInterface {
  createPayment(payment: Payment): Promise<void>;
  findPaymentByPaymentID(id: any): Promise<Payment | null>;
  findPaymentByClerkId(id: any): Promise<PaymentResponse[]>;
  updatePayment(paymentToUpdate: any, id: any): Promise<void>;
}
