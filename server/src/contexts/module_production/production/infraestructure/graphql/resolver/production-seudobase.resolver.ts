import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ProductionSeudoBaseAdapterInterface } from '../../../application/adapter/production-seudobase.adapter.interface';
import {
  ProductionBulkDeleteInput,
  ProductionBulkPriceInput,
  ProductionBulkVisibilityInput,
  ProductionSeudoBaseFilters,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-seudobase.request';
import {
  ProductionAuditLogResponse,
  ProductionBulkResultResponse,
  ProductionSeudoBaseResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production-seudobase.response';
import { ProductionGqlContext, requireUserId } from './production.context';

/**
 * SeudoBase (Fase 7): vista tipo Excel y operaciones masivas del staff del
 * blog. Toda operación masiva exige `confirm: true` y queda auditada.
 */
@Resolver()
@UseGuards(ClerkAuthGuard)
export class ProductionSeudoBaseResolver {
  constructor(
    @Inject('ProductionSeudoBaseAdapterInterface')
    private readonly seudoBaseAdapter: ProductionSeudoBaseAdapterInterface,
  ) {}

  @Query(() => ProductionSeudoBaseResponse, {
    description:
      'Tabla de gestión del blog con filtros y búsqueda (SB-01). Sólo staff',
  })
  async getProductionSeudoBase(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('filters', { type: () => ProductionSeudoBaseFilters, nullable: true })
    filters: ProductionSeudoBaseFilters | undefined,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionSeudoBaseResponse> {
    return this.seudoBaseAdapter.getProductionSeudoBase(
      productionId,
      requireUserId(context),
      filters,
      page,
      limit,
    );
  }

  @Mutation(() => ProductionBulkResultResponse, {
    description:
      'Edición masiva del precio de los tickets pagos propios de los ítems (SB-02)',
  })
  async bulkUpdateProductionPrices(
    @Args('input', { type: () => ProductionBulkPriceInput })
    input: ProductionBulkPriceInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionBulkResultResponse> {
    return this.seudoBaseAdapter.bulkUpdateProductionPrices(
      input,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionBulkResultResponse, {
    description: 'Cambio masivo de visibilidad (SB-02)',
  })
  async bulkUpdateProductionVisibility(
    @Args('input', { type: () => ProductionBulkVisibilityInput })
    input: ProductionBulkVisibilityInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionBulkResultResponse> {
    return this.seudoBaseAdapter.bulkUpdateProductionVisibility(
      input,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionBulkResultResponse, {
    description: 'Borrado masivo con hard delete que libera cupo (SB-02/03)',
  })
  async bulkDeleteProductionItems(
    @Args('input', { type: () => ProductionBulkDeleteInput })
    input: ProductionBulkDeleteInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionBulkResultResponse> {
    return this.seudoBaseAdapter.bulkDeleteProductionItems(
      input,
      requireUserId(context),
    );
  }

  @Query(() => ProductionAuditLogResponse, {
    description: 'Auditoría de las operaciones masivas del blog (SB-03)',
  })
  async getProductionAuditLog(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionAuditLogResponse> {
    return this.seudoBaseAdapter.getProductionAuditLog(
      productionId,
      requireUserId(context),
      page,
      limit,
    );
  }
}
