import { getLocalTimeZone, now } from '@internationalized/date';
import { BadRequestException, Inject } from '@nestjs/common';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import Payment from 'src/contexts/webhook/domain/mercadopago/entity/payment.entity';
import { MercadoPagoPaymentsRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-payments.repository.interface';
import { MpPaymentServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-payments.service.interface';

export class MpPaymentService implements MpPaymentServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoPaymentsRepositoryInterface')
    private readonly mpPaymentRepository: MercadoPagoPaymentsRepositoryInterface,
  ) {}

  async createPayment(payment: any): Promise<void> {
    this.logger.log(
      'Creating payment for suscription description: ' + payment.description,
    );
    this.logger.log('Creating payment with ID: ' + payment.id);
    const timeOfUpdate = now(getLocalTimeZone()).toString();
    if (payment && payment.payer) {
      const newPayment = new Payment(
        payment.id,
        payment.payer.id,
        payment.payer.email,
        payment.payment_type_id,
        payment.payment_method_id,
        payment.transaction_amount,
        payment.date_approved,
        payment.external_reference,
        payment.status_detail,
        timeOfUpdate,
        payment.status,
      );
      console.log(newPayment);
      await this.mpPaymentRepository.createPayment(newPayment);
    } else {
      this.logger.error('Invalid payment data - Error in payment service');
      throw new BadRequestException('Invalid payment data');
    }
  }

  async findPaymentByPaymentID(id: string): Promise<Payment | null> {
    try {
      const payment = await this.mpPaymentRepository.findPaymentByPaymentID(id);
      if (payment) this.logger.log(`Payment with id ${id} successfully found.`);
      return payment;
    } catch (error: any) {
      throw error;
    }
  }

  async findPaymentByClerkId(id: string): Promise<any> {
    try {
      return await this.mpPaymentRepository.findPaymentByClerkId(id);
    } catch (error: any) {
      throw error;
    }
  }

  async updatePayment(payment: any): Promise<void> {
    const timeOfUpdate = now(getLocalTimeZone()).toString();
    const mpPaymentId = payment.id;
    const paymentUpdated = {
      payerId: payment.payer.id,
      payerEmail: payment.payer.email,
      paymentTypeId: payment.payment_type_id,
      paymentMethodId: payment.payment_method_id,
      transactionAmount: payment.transaction_amount,
      dateApproved: payment.date_approved,
      external_reference: payment.external_reference,
      status_detail: payment.status_detail,
      timeOfUpdate: timeOfUpdate,
      status: payment.status,
    };
    await this.mpPaymentRepository.updatePayment(paymentUpdated, mpPaymentId);
  }
}
