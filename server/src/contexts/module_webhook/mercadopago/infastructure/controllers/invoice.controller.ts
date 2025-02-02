import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { InvoiceAdapterInterface } from '../../application/adapter/in/mp-invoice.adapter.internface';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';


@Controller('mercadopago/invoice')
export class InvoiceController {
  constructor(
    @Inject('InvoiceAdapterInterface')
    private readonly invoiceAdapter: InvoiceAdapterInterface,
  ) { }

  @Get(':external_reference')
  @UseGuards(ClerkAuthGuard)
  async getInvoiceFromExternal_reference(
    @Param('external_reference') external_reference: string,
  ) {
    return this.invoiceAdapter.getInvoicesByExternalReference(
      external_reference,
    );
  }


}
