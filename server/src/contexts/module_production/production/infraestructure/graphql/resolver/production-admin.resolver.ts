import { Inject, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { AdminGuard } from 'src/contexts/module_shared/auth/clerk-auth/admin.guard';
import { ProductionAdapterInterface } from '../../../application/adapter/production.adapter.interface';
import { ProductionResponse } from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';

/**
 * Operaciones de los admins de la plataforma sobre Mis Producciones.
 * ClerkAuthGuard valida el token; AdminGuard exige el rol.
 */
@Resolver()
@UseGuards(ClerkAuthGuard, AdminGuard)
export class ProductionAdminResolver {
  constructor(
    @Inject('ProductionAdapterInterface')
    private readonly productionAdapter: ProductionAdapterInterface,
  ) {}

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
}
