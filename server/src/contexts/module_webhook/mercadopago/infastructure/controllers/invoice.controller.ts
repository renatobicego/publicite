import { Controller, Get, Inject, Param } from '@nestjs/common';
import { InvoiceAdapterInterface } from '../../application/adapter/in/mp-invoice.adapter.internface';


@Controller('mercadopago/invoice')
export class InvoiceController {
  constructor(
    @Inject('InvoiceAdapterInterface')
    private readonly invoiceAdapter: InvoiceAdapterInterface,
  ) { }

  @Get(':external_reference')
  async getInvoiceFromExternal_reference(
    @Param('external_reference') external_reference: string,
  ) {
    return this.invoiceAdapter.getInvoicesByExternalReference(
      external_reference,
    );
  }


}
