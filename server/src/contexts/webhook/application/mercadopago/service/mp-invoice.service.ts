import { Inject } from '@nestjs/common';
import { MercadoPagoInvoiceRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-invoice.respository.interface';
import { MpServiceInvoiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-invoice.service.interface';

export class MpInvoiceService implements MpServiceInvoiceInterface {
  constructor(
    @Inject('MercadoPagoInvoiceRepositoryInterface')
    private readonly mpServiceInvoice: MercadoPagoInvoiceRepositoryInterface,
  ) {}
  async getInvoicesByExternalReference(
    external_reference: string,
  ): Promise<any[]> {
    try {
      const invoice =
        await this.mpServiceInvoice.getInvoicesByExternalReference(
          external_reference,
        );
      return invoice;
    } catch (error: any) {
      throw error;
    }
  }
}
