import { Inject } from '@nestjs/common';
import { MpPaymentAdapterInterface } from 'src/contexts/module_webhook/application/mercadopago/adapter/mp-payment.adapter.interface';
import { MpPaymentServiceInterface } from 'src/contexts/module_webhook/domain/mercadopago/service/mp-payments.service.interface';

export class MpPaymentAdapter implements MpPaymentAdapterInterface {
  constructor(
    @Inject('MpPaymentServiceInterface')
    private readonly paymentService: MpPaymentServiceInterface,
  ) {}
  async getPaymentByClerkId(external_reference: string): Promise<any> {
    try {
      return await this.paymentService.findPaymentByClerkId(external_reference);
    } catch (error: any) {
      throw error;
    }
  }
}
