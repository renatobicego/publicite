import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { PaymentResponse } from 'src/contexts/module_webhook/mercadopago/application/adapter/HTTP-RESPONSE/payment.response';
import { MpPaymentAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-payment.adapter.interface';

@Resolver('payment')
export class MpPaymentResolver {
  constructor(
    @Inject('MpPaymentAdapterInterface')
    private readonly paymentAdapter: MpPaymentAdapterInterface,
  ) {}

  @Query(() => [PaymentResponse], {
    nullable: true,
    description: 'Buscar los pagos por id de clerk',
  })
  async findPaymentByMongoId(
    @Args('id', { type: () => String })
    id: string,
  ): Promise<PaymentResponse[]> {
    try {
      return await this.paymentAdapter.getPaymentByMongoId(id);
    } catch (error: any) {
      throw error;
    }
  }
}
