import { PaymentResponse } from 'src/contexts/module_webhook/mercadopago/application/adapter/HTTP-RESPONSE/payment.response';
import Payment from '../../../mercadopago/domain/entity/payment.entity';

export interface MercadoPagoPaymentsRepositoryInterface {
  createPayment(payment: Payment): Promise<void>;
  findPaymentByPaymentID(id: any): Promise<Payment | null>;
  findPaymentByClerkId(id: any): Promise<PaymentResponse[]>;
  updatePayment(paymentToUpdate: any, id: any): Promise<void>;
}
