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
  async updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void> {
    try {
      const invoiceUpdated = await this.invoiceModel.findOneAndUpdate(
        { preapprovalId: id },
        subscription_authorized_payment_to_update,
        { new: true },
      );

      if (!invoiceUpdated) {
        throw new Error(`No invoice found with preapprovalId: ${id}`);
      }
    } catch (error: any) {
      throw new Error(
        `Error updating invoice with preapprovalId: ${id}: ${error.message}`,
      );
    }
  }

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
