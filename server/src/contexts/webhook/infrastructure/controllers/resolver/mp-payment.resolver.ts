import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { PaymentResponse } from 'src/contexts/webhook/application/mercadopago/adapter/HTTP-RESPONSE/payment.response';

import { MpPaymentAdapterInterface } from 'src/contexts/webhook/application/mercadopago/adapter/mp-payment.adapter.interface';

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
  async findPaymentByClerkId(
    @Args('id', { type: () => String })
    id: string,
  ): Promise<PaymentResponse[]> {
    try {
      return await this.paymentAdapter.getPaymentByClerkId(id);
    } catch (error: any) {
      throw error;
    }
  }
}
