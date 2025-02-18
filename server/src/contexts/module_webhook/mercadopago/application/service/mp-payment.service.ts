import { BadRequestException, Inject } from '@nestjs/common';


import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import Payment from 'src/contexts/module_webhook/mercadopago/domain/entity/payment.entity';
import { MpPaymentServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-payments.service.interface';
import { MercadoPagoPaymentsRepositoryInterface } from '../../domain/repository/mp-payments.repository.interface';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';

export class MpPaymentService implements MpPaymentServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoPaymentsRepositoryInterface')
    private readonly mpPaymentRepository: MercadoPagoPaymentsRepositoryInterface,
  ) { }

  async createPayment(payment: any): Promise<void> {
    try {
      this.logger.log(
        'Creating payment for suscription description: ' + payment.description,
      );
      this.logger.log('Creating payment with ID: ' + payment.id);
      const timeOfUpdate = getTodayDateTime();
      if (payment && payment.payer) {
        const newPayment = new Payment(
          payment.id,
          payment.description,
          payment.metadata.preapproval_id,
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
    } catch (error: any) {
      throw error;
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

  async getPaymentByMongoId(id: string): Promise<any> {
    try {
      return await this.mpPaymentRepository.getPaymentByMongoId(id);
    } catch (error: any) {
      throw error;
    }
  }

  async updatePayment(payment: any): Promise<void> {
    try {
      this.logger.log("Mp-Payment-Service Updating payment with ID: " + payment.id);
      const timeOfUpdate = getTodayDateTime();
      const mpPaymentId = payment.id;
      const paymentUpdated = {
        payerEmail: payment.payer.email,
        paymentTypeId: payment.payment_type_id,
        paymentMethodId: payment.payment_method_id,
        transactionAmount: payment.transaction_amount,
        dateApproved: payment.date_approved,
        status_detail: payment.status_detail,
        timeOfUpdate: timeOfUpdate,
        status: payment.status,
      };
      await this.mpPaymentRepository.updatePayment(paymentUpdated, mpPaymentId);
    } catch (error: any) {
      throw error;
    }
  }

}