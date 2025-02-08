import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { InvoiceAdapterInterface } from '../../application/adapter/in/mp-invoice.adapter.internface';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { InvoiceGetAllResponse } from '../../domain/graphql_models/response/invoice.model.graphql';


@Resolver('invoice')
export class MpInvoiceResolver {
    constructor(
        @Inject('InvoiceAdapterInterface')
        private readonly invoiceAdapter: InvoiceAdapterInterface,
    ) { }

    @Query(() => InvoiceGetAllResponse, {
        nullable: true,
        description: 'Buscar los pagos por id de mongo',
    })
    @UseGuards(ClerkAuthGuard)
    async getAllInvoicesByExternalReferenceId(
        @Args('limit', { type: () => Number })
        limit: number,
        @Args('page', { type: () => Number })
        page: number,
        @Context() context: { req: CustomContextRequestInterface },
    ): Promise<InvoiceGetAllResponse> {
        try {
            const userRequestId = context.req.userRequestId;
            return await this.invoiceAdapter.getInvoicesByExternalReferenceId(userRequestId, page, limit);
        } catch (error: any) {
            throw error;
        }
    }
}
