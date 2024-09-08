import { InjectModel } from '@nestjs/mongoose';
import { MercadoPagoInvoiceRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-invoice.respository.interface';
import { InvoiceDocument } from '../../schemas/mercadopago/invoice.schema';
import { Model } from 'mongoose';

export class MpInvoiceRepository
  implements MercadoPagoInvoiceRepositoryInterface
{
  constructor(
    @InjectModel('Invoice')
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}
  async getInvoicesByExternalReference(
    external_reference: string,
  ): Promise<any[]> {
    return await this.invoiceModel.find({ external_reference });
  }
}
