import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InvoiceDocument } from '../schemas/invoice.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import Invoice from 'src/contexts/module_webhook/mercadopago/domain/entity/invoice.entity';
import { MercadoPagoInvoiceRepositoryInterface } from '../../domain/repository/mp-invoice.respository.interface';


export class MpInvoiceRepository
  implements MercadoPagoInvoiceRepositoryInterface {
  constructor(
    @InjectModel('Invoice')
    private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly logger: MyLoggerService,
  ) { }
  async updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<any> {
    try {
      const invoiceUpdated = await this.invoiceModel.findOneAndUpdate(
        { invoice_id: id },
        subscription_authorized_payment_to_update,
        { new: true },
      );

      if (!invoiceUpdated) {
        throw new Error(`No invoice found with preapprovalId: ${id}`);
      }
      return invoiceUpdated;
    } catch (error: any) {
      throw new Error(
        `Error updating invoice with preapprovalId: ${id}: ${error.message}`,
      );
    }
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      this.logger.log(
        'saving new Invoice in database Invoice ID: ' + invoice.getPaymentId(),
      );
      const newInvoice = new this.invoiceModel(invoice);
      console.log(newInvoice);

      await newInvoice.save();
      this.logger.log(
        'the invoice payment ID: ' +
        newInvoice.paymentId +
        ' has been related to subscription ID: ' +
        newInvoice.subscriptionId,
      );
    } catch (error: any) {
      throw error;
    }

  }
  async getInvoicesByExternalReference(
    external_reference: string,
  ): Promise<any[]> {
    try {
      return await this.invoiceModel.find({ external_reference })
        .populate([
          { path: 'subscriptionId', model: 'Subscription' },
          { path: 'paymentId', model: 'Payment' },
        ]);
    } catch (error: any) {
      throw error;
    }
  }
}
