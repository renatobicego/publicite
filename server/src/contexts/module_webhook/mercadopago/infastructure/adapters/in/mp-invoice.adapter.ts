import { Inject } from '@nestjs/common';
import { InvoiceAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-invoice.adapter.internface';
import { MpServiceInvoiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-invoice.service.interface';
import {
  AdminInvoice,
  AdminInvoiceGetAllResponse,
} from 'src/contexts/module_webhook/mercadopago/domain/graphql_models/response/admin-invoice.model.graphql';
import { AdminInvoiceFilters } from 'src/contexts/module_webhook/mercadopago/domain/repository/mp-invoice.respository.interface';

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

  async generateInvoiceTicket(
    invoiceId: string,
    userRequestId: string,
    isAdmin?: boolean,
  ): Promise<Buffer> {
    try {
      return await this.mpServiceInvoice.generateInvoiceTicket(
        invoiceId,
        userRequestId,
        isAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getAllInvoicesAdmin(
    page: number,
    limit: number,
    filters?: AdminInvoiceFilters,
  ): Promise<AdminInvoiceGetAllResponse> {
    try {
      return await this.mpServiceInvoice.getAllInvoicesAdmin(
        page,
        limit,
        filters,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async attachFacturaToInvoice(
    invoiceId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<AdminInvoice> {
    try {
      return await this.mpServiceInvoice.attachFacturaToInvoice(
        invoiceId,
        facturaUrl,
        adminId,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
