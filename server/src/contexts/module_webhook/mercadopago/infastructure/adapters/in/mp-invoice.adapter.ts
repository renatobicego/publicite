import { Inject } from '@nestjs/common';
import { InvoiceAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-invoice.adapter.internface';
import { MpServiceInvoiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-invoice.service.interface';

export class MpInvoiceAdapter implements InvoiceAdapterInterface {
  constructor(
    @Inject('MpServiceInvoiceInterface')
    private readonly mpServiceInvoice: MpServiceInvoiceInterface,
  ) {}
  async getInvoicesByExternalReference(
    external_reference: string,
  ): Promise<any[]> {
    try {
      const invoice =
        await this.mpServiceInvoice.getInvoicesByExternalReference(external_reference);
      return invoice;
    } catch (error: any) {
      throw error;
    }
  }
}
