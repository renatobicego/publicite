import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { AdminGuard } from 'src/contexts/module_shared/auth/clerk-auth/admin.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { InvoiceAdapterInterface } from '../../application/adapter/in/mp-invoice.adapter.internface';
import { AdminInvoiceFiltersInput } from '../../application/dto/admin-invoice-filters.input';
import { AttachFacturaInput } from '../../application/dto/attach-factura.input';
import {
  AdminInvoice,
  AdminInvoiceGetAllResponse,
} from '../../domain/graphql_models/response/admin-invoice.model.graphql';

/**
 * Panel admin de tickets. ClerkAuthGuard valida el token y setea el
 * userRequestId (el mongoId del admin, que se guarda como `facturaUploadedBy`);
 * AdminGuard exige el rol.
 */
@Resolver()
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminInvoiceResolver {
  constructor(
    @Inject('InvoiceAdapterInterface')
    private readonly invoiceAdapter: InvoiceAdapterInterface,
  ) {}

  @Query(() => AdminInvoiceGetAllResponse, {
    description:
      'Sólo admin: todos los tickets de todos los usuarios, paginados y filtrables',
  })
  async getAllInvoicesAdmin(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('filters', { type: () => AdminInvoiceFiltersInput, nullable: true })
    filters?: AdminInvoiceFiltersInput,
  ): Promise<AdminInvoiceGetAllResponse> {
    try {
      return await this.invoiceAdapter.getAllInvoicesAdmin(page, limit, filters);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => AdminInvoice, {
    description: 'Sólo admin: asocia una factura (archivo ya subido) a un ticket',
  })
  async attachFacturaToInvoice(
    @Args('input', { type: () => AttachFacturaInput })
    input: AttachFacturaInput,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<AdminInvoice> {
    try {
      return await this.invoiceAdapter.attachFacturaToInvoice(
        input.invoiceId,
        input.facturaUrl,
        context.req.userRequestId,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
