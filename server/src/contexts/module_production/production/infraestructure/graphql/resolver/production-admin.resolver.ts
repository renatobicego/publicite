import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { AdminGuard } from 'src/contexts/module_shared/auth/clerk-auth/admin.guard';
import { ProductionAdapterInterface } from '../../../application/adapter/production.adapter.interface';
import { ProductionTicketAdapterInterface } from '../../../application/adapter/production-ticket.adapter.interface';
import { ProductionResponse } from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import {
  AttachProductionTicketFacturaInput,
  ProductionTicketPurchaseFilters,
  ProductionTicketRejectInput,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-ticket.request';
import {
  ProductionTicketPurchaseListResponse,
  ProductionTicketPurchaseResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production-ticket.response';
import { ProductionGqlContext, requireUserId } from './production.context';
import { ProductionModerationAdapterInterface } from '../../../application/adapter/production-moderation.adapter.interface';
import { ProductionModerationInput } from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-report.request';
import {
  ProductionModerationResultResponse,
  ProductionReportDetailResponse,
  ProductionReportTargetListResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production-report.response';
import { ProductionReportStatus } from '../../../domain/entity/enum/production-report.enums';
import { ProductionCommissionStatus } from '../../../domain/entity/enum/production-ticket.enums';

/**
 * Operaciones de los admins de la plataforma sobre Mis Producciones.
 * ClerkAuthGuard valida el token y setea el userRequestId (queda registrado
 * como autor de cada acción); AdminGuard exige el rol.
 */
@Resolver()
@UseGuards(ClerkAuthGuard, AdminGuard)
export class ProductionAdminResolver {
  constructor(
    @Inject('ProductionAdapterInterface')
    private readonly productionAdapter: ProductionAdapterInterface,
    @Inject('ProductionTicketAdapterInterface')
    private readonly ticketAdapter: ProductionTicketAdapterInterface,
    @Inject('ProductionModerationAdapterInterface')
    private readonly moderationAdapter: ProductionModerationAdapterInterface,
  ) {}

  // --- Denuncias: revisión (DEN-03) --------------------------------------------

  @Query(() => ProductionReportTargetListResponse, {
    description:
      'Sólo admin: contenidos denunciados agrupados, con su estado de moderación',
  })
  async getProductionReportTargetsAdmin(
    @Args('status', {
      type: () => ProductionReportStatus,
      defaultValue: ProductionReportStatus.pending,
    })
    status: ProductionReportStatus,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<ProductionReportTargetListResponse> {
    return this.moderationAdapter.getProductionReportTargetsAdmin(
      status,
      page,
      limit,
    );
  }

  @Query(() => [ProductionReportDetailResponse], {
    description: 'Sólo admin: denuncias de un blog o de un contenido',
  })
  async getProductionTargetReportsAdmin(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('itemId', { type: () => ID, nullable: true }) itemId: string | undefined,
  ): Promise<ProductionReportDetailResponse[]> {
    return this.moderationAdapter.getProductionTargetReportsAdmin(
      productionId,
      itemId,
    );
  }

  @Mutation(() => ProductionModerationResultResponse, {
    description:
      'Sólo admin: confirma el bloqueo o restaura el contenido denunciado',
  })
  async moderateProductionContent(
    @Args('input', { type: () => ProductionModerationInput })
    input: ProductionModerationInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionModerationResultResponse> {
    return this.moderationAdapter.moderateProductionContent(
      input,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionResponse, {
    description: 'Sólo admin: fija o quita un blog de "Producciones destacadas"',
  })
  async setProductionFeatured(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('isFeatured', { type: () => Boolean }) isFeatured: boolean,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.setProductionFeatured(
      productionId,
      isFeatured,
    );
  }

  // --- Tickets: panel admin/invoices (TKT-06, TKT-11) ----------------------------

  @Query(() => ProductionTicketPurchaseListResponse, {
    description:
      'Sólo admin: compras de tickets de todos los blogs, para controlar las comisiones',
  })
  async getProductionTicketPurchasesAdmin(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('filters', { type: () => ProductionTicketPurchaseFilters, nullable: true })
    filters: ProductionTicketPurchaseFilters | undefined,
  ): Promise<ProductionTicketPurchaseListResponse> {
    return this.ticketAdapter.getProductionTicketPurchasesAdmin(
      filters,
      page,
      limit,
    );
  }

  @Mutation(() => ProductionTicketPurchaseResponse, {
    description:
      'Sólo admin: marca la comisión como cobrada (paid) o impaga (unpaid). Impaga suspende el acceso hasta que se marque cobrada',
  })
  async setProductionTicketCommissionStatus(
    @Args('purchaseId', { type: () => ID }) purchaseId: string,
    @Args('status', { type: () => ProductionCommissionStatus })
    status: ProductionCommissionStatus,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseResponse> {
    return this.ticketAdapter.setProductionTicketCommissionStatus(
      purchaseId,
      status,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionTicketPurchaseResponse, {
    description: 'Sólo admin: rechaza una compra pendiente',
  })
  async rejectProductionTicketPurchaseAsAdmin(
    @Args('input', { type: () => ProductionTicketRejectInput })
    input: ProductionTicketRejectInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseResponse> {
    return this.ticketAdapter.rejectProductionTicketPurchaseAsAdmin(
      input.purchaseId,
      input.reason,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionTicketPurchaseResponse, {
    description: 'Sólo admin: asocia la factura de la comisión, para el comprador',
  })
  async attachFacturaToProductionTicketPurchase(
    @Args('input', { type: () => AttachProductionTicketFacturaInput })
    input: AttachProductionTicketFacturaInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseResponse> {
    return this.ticketAdapter.attachFacturaToProductionTicketPurchase(
      input.purchaseId,
      input.facturaUrl,
      requireUserId(context),
    );
  }
}
