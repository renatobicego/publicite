import { InjectModel } from '@nestjs/mongoose';
import { MercadoPagoInvoiceRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-invoice.respository.interface';
import { InvoiceDocument } from '../../schemas/mercadopago/invoice.schema';
import { Model } from 'mongoose';
import Invoice from 'src/contexts/webhook/domain/mercadopago/entity/invoice.entity';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

export class MpInvoiceRepository
  implements MercadoPagoInvoiceRepositoryInterface
{
  constructor(
    @InjectModel('Invoice')
    private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly logger: MyLoggerService,
  ) {}
  async saveInvoice(invoice: Invoice): Promise<void> {
    this.logger.log(
      'saving new Invoice in database Invoice ID: ' + invoice.getPaymentId(),
    );
    const newInvoice = new this.invoiceModel(invoice);
    await newInvoice.save();
    this.logger.log(
      'the invoice payment ID: ' +
        newInvoice.paymentId +
        ' has been related to subscription ID: ' +
        newInvoice.subscriptionId,
    );
  }
  async getInvoicesByExternalReference(
    external_reference: string,
  ): Promise<any[]> {
    return await this.invoiceModel.find({ external_reference });
  }
}
