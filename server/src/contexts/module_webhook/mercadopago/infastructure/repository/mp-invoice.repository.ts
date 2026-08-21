import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { InvoiceDocument } from '../schemas/invoice.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import Invoice from 'src/contexts/module_webhook/mercadopago/domain/entity/invoice.entity';
import {
  AdminInvoiceFilters,
  AdminInvoicesPage,
  MercadoPagoInvoiceRepositoryInterface,
} from '../../domain/repository/mp-invoice.respository.interface';


export class MpInvoiceRepository
  implements MercadoPagoInvoiceRepositoryInterface {
  constructor(
    @InjectModel('Invoice')
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
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

  async getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any> {
    try {
      const invoices = await this.invoiceModel.find({ external_reference: id })
        .populate([
          { path: 'subscriptionId', model: 'Subscription' },
          { path: 'paymentId', model: 'Payment' },
        ]).limit(limit + 1).skip((page - 1) * limit)

      if (invoices.length <= 0) {
        return {
          invoices: [],
          hasMore: false
        }
      }
      const hasMore = invoices.length > limit;
      return {
        invoices: invoices.slice(0, limit),
        hasMore: hasMore
      }
    } catch (error: any) {
      throw error;
    }

  }

  async getAllInvoicesPaginated(
    page: number,
    limit: number,
    filters?: AdminInvoiceFilters,
  ): Promise<AdminInvoicesPage> {
    try {
      const query = await this.buildAdminQuery(filters);

      // Con un filtro de usuario que no matcheó a nadie, la query queda vacía a
      // propósito: devolvemos página vacía sin ir a la base.
      if (query === null) {
        return { invoices: [], total: 0, hasMore: false };
      }

      const [total, invoices] = await Promise.all([
        this.invoiceModel.countDocuments(query),
        this.invoiceModel
          .find(query)
          .sort({ timeOfUpdate: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate([
            { path: 'subscriptionId', model: 'Subscription' },
            { path: 'paymentId', model: 'Payment' },
          ]),
      ]);

      return {
        invoices,
        total,
        hasMore: page * limit < total,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async attachFactura(
    invoiceId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<any> {
    try {
      const updated = await this.invoiceModel
        .findByIdAndUpdate(
          invoiceId,
          {
            facturaUrl,
            facturaUploadedAt: new Date(),
            facturaUploadedBy: adminId,
          },
          { new: true },
        )
        .populate([
          { path: 'subscriptionId', model: 'Subscription' },
          { path: 'paymentId', model: 'Payment' },
        ]);

      if (!updated) {
        throw new Error(`No invoice found with id: ${invoiceId}`);
      }
      this.logger.log(
        `Factura asociada al invoice ${invoiceId} por el admin ${adminId}`,
      );
      return updated;
    } catch (error: any) {
      throw error;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<any[]> {
    try {
      const validIds = userIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id),
      );
      if (validIds.length <= 0) return [];

      return await this.userModel
        .find({ _id: { $in: validIds } })
        .select('_id name lastName username email')
        .lean();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Arma el filtro de Mongo del panel admin.
   * Devuelve `null` cuando el filtro de usuario no matcheó a nadie (así el
   * llamador corta sin ejecutar una query que igual no puede traer nada).
   */
  private async buildAdminQuery(
    filters?: AdminInvoiceFilters,
  ): Promise<Record<string, any> | null> {
    const query: Record<string, any> = {};

    if (filters?.userId) {
      query.external_reference = filters.userId;
    }

    if (filters?.userSearch?.trim()) {
      const term = filters.userSearch.trim();
      const regex = new RegExp(this.escapeRegex(term), 'i');
      const users = await this.userModel
        .find({
          $or: [
            { name: regex },
            { lastName: regex },
            { username: regex },
            { email: regex },
          ],
        })
        .select('_id')
        .lean();

      if (users.length <= 0) return null;

      const ids = users.map((user: any) => user._id.toString());
      // Si además vino un userId puntual, ambos filtros tienen que coincidir.
      if (query.external_reference && !ids.includes(query.external_reference)) {
        return null;
      }
      if (!query.external_reference) {
        query.external_reference = { $in: ids };
      }
    }

    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    // `timeOfUpdate` se guarda como string ISO con zona
    // ("2026-08-20T19:18:00-03:00[America/...]"), así que el rango se compara
    // lexicográficamente por el prefijo YYYY-MM-DD. Para el "hasta" usamos $lt
    // del día siguiente y no $lte del mismo día: si no, se perderían los pagos
    // de ese último día que tienen hora.
    const dateQuery: Record<string, string> = {};
    if (filters?.dateFrom) {
      dateQuery.$gte = filters.dateFrom.slice(0, 10);
    }
    if (filters?.dateTo) {
      dateQuery.$lt = this.nextDay(filters.dateTo.slice(0, 10));
    }
    if (Object.keys(dateQuery).length > 0) {
      query.timeOfUpdate = dateQuery;
    }

    if (filters?.hasFactura === true) {
      query.facturaUrl = { $nin: [null, ''] };
    } else if (filters?.hasFactura === false) {
      query.facturaUrl = { $in: [null, ''] };
    }

    return query;
  }

  private nextDay(date: string): string {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (isNaN(parsed.getTime())) return date;
    parsed.setUTCDate(parsed.getUTCDate() + 1);
    return parsed.toISOString().slice(0, 10);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async getInvoiceByIdForTicket(invoiceId: string): Promise<any> {
    try {
      return await this.invoiceModel
        .findById(invoiceId)
        .populate({ path: 'paymentId', model: 'Payment' })
        .populate({
          path: 'subscriptionId',
          model: 'Subscription',
          populate: { path: 'subscriptionPlan', model: 'SubscriptionPlan' },
        });
    } catch (error: any) {
      throw error;
    }
  }

}
