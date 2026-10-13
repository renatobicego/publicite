import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ProductionModerationAdapterInterface } from '../../../application/adapter/production-moderation.adapter.interface';
import { ProductionReportInput } from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-report.request';
import {
  ProductionReceivedReportResponse,
  ProductionReportResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production-report.response';
import { ProductionGqlContext, requireUserId } from './production.context';

/**
 * Denuncias de los usuarios (Fase 9). La revisión del admin está en
 * ProductionAdminResolver.
 */
@Resolver()
export class ProductionModerationResolver {
  constructor(
    @Inject('ProductionModerationAdapterInterface')
    private readonly moderationAdapter: ProductionModerationAdapterInterface,
  ) {}

  @Mutation(() => ProductionReportResponse, {
    description:
      'Denunciar un blog o un contenido (DEN-01). Al superar el umbral se oculta hasta la revisión (DEN-02)',
  })
  @UseGuards(ClerkAuthGuard)
  async reportProductionContent(
    @Args('input', { type: () => ProductionReportInput })
    input: ProductionReportInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionReportResponse> {
    return this.moderationAdapter.reportProductionContent(
      input,
      requireUserId(context),
    );
  }

  @Query(() => [ProductionReceivedReportResponse], {
    description:
      'Denuncias que recibió el blog, para su staff: qué se denunció y por qué, sin revelar al denunciante',
  })
  @UseGuards(ClerkAuthGuard)
  async getProductionReceivedReports(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionReceivedReportResponse[]> {
    return this.moderationAdapter.getProductionReceivedReports(
      productionId,
      requireUserId(context),
    );
  }
}
