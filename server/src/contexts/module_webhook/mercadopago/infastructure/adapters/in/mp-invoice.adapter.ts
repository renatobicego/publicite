import { Inject } from '@nestjs/common';
import { InvoiceAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-invoice.adapter.internface';
import { MpServiceInvoiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-invoice.service.interface';

export class MpInvoiceAdapter implements InvoiceAdapterInterface {
  constructor(
    @Inject('MpServiceInvoiceInterface')
    private readonly mpServiceInvoice: MpServiceInvoiceInterface,
  ) { }




  async getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any[]> {
    try {
      const invoice =
        await this.mpServiceInvoice.getInvoicesByExternalReferenceId(id, page, limit);
      return invoice;
    } catch (error: any) {
      throw error;
    }
  }
}
