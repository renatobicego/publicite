import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ProductionTicketAdapterInterface } from '../../../application/adapter/production-ticket.adapter.interface';
import {
  ProductionTicketCreateRequest,
  ProductionTicketPurchaseRequest,
  ProductionTicketUpdateRequest,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-ticket.request';
import {
  ProductionTicketCheckoutResponse,
  ProductionTicketPurchaseListResponse,
  ProductionTicketPurchaseResponse,
  ProductionTicketResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production-ticket.response';
import { ProductionResponse } from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import { ProductionTicketPurchaseStatus } from '../../../domain/entity/enum/production-ticket.enums';
import { ProductionGqlContext, requireUserId } from './production.context';

/**
 * Tickets de Mis Producciones (Fase 5): Page de Ticket del staff y compra
 * por transferencia del visitante. Las operaciones del admin de la
 * plataforma están en ProductionAdminResolver.
 */
@Resolver()
@UseGuards(ClerkAuthGuard)
export class ProductionTicketResolver {
  constructor(
    @Inject('ProductionTicketAdapterInterface')
    private readonly ticketAdapter: ProductionTicketAdapterInterface,
  ) {}

  // --- Staff del blog ---------------------------------------------------------

  @Mutation(() => ProductionTicketResponse, {
    description:
      'Asigna un ticket a una carpeta, archivo o al blog entero (TKT-01..03)',
  })
  async createProductionTicket(
    @Args('ticketRequest', { type: () => ProductionTicketCreateRequest })
    ticketRequest: ProductionTicketCreateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketResponse> {
    return this.ticketAdapter.createProductionTicket(
      ticketRequest,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionTicketResponse, {
    description:
      'Edita un ticket; isPaid es el toggle pago/gratuito de toda la carpeta (TKT-02)',
  })
  async updateProductionTicket(
    @Args('ticketId', { type: () => ID }) ticketId: string,
    @Args('ticketUpdate', { type: () => ProductionTicketUpdateRequest })
    ticketUpdate: ProductionTicketUpdateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketResponse> {
    return this.ticketAdapter.updateProductionTicket(
      ticketId,
      ticketUpdate,
      requireUserId(context),
    );
  }

  @Mutation(() => String, { description: 'Quita el ticket de su contenido' })
  async deleteProductionTicket(
    @Args('ticketId', { type: () => ID }) ticketId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.ticketAdapter.deleteProductionTicket(
      ticketId,
      requireUserId(context),
    );
    return 'Ticket eliminado con éxito';
  }

  @Query(() => [ProductionTicketResponse], {
    description: 'Tickets del blog con sus métricas (staff)',
  })
  async getProductionTickets(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketResponse[]> {
    return this.ticketAdapter.getProductionTickets(
      productionId,
      requireUserId(context),
    );
  }

  @Query(() => ProductionTicketPurchaseListResponse, {
    description: 'Ventas de tickets del blog (staff)',
  })
  async getProductionTicketSales(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('status', { type: () => ProductionTicketPurchaseStatus, nullable: true })
    status: ProductionTicketPurchaseStatus | undefined,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseListResponse> {
    return this.ticketAdapter.getProductionTicketSales(
      productionId,
      requireUserId(context),
      status,
      page,
      limit,
    );
  }

  @Mutation(() => ProductionTicketPurchaseResponse, {
    description:
      'El creador habilita el acceso de una compra con el pago confirmado (TKT-07)',
  })
  async activateProductionTicketPurchase(
    @Args('purchaseId', { type: () => ID }) purchaseId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseResponse> {
    return this.ticketAdapter.activateProductionTicketPurchase(
      purchaseId,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionResponse, {
    description:
      'Alias o CBU donde se liquida el 90% de los tickets (TKT-11). Sólo el admin del blog',
  })
  async setProductionPayoutAlias(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('aliasCbu', { type: () => String }) aliasCbu: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.ticketAdapter.setProductionPayoutAlias(
      productionId,
      aliasCbu,
      requireUserId(context),
    );
  }

  // --- Visitante ----------------------------------------------------------------

  @Query(() => ProductionTicketCheckoutResponse, {
    description:
      'Datos previos a la compra: archivos incluidos, aviso sin devoluciones y datos de transferencia (TKT-04)',
  })
  async getProductionTicketCheckout(
    @Args('ticketId', { type: () => ID }) ticketId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketCheckoutResponse> {
    return this.ticketAdapter.getProductionTicketCheckout(
      ticketId,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionTicketPurchaseResponse, {
    description:
      'Compra un ticket: pago por transferencia pendiente de confirmación, o acceso inmediato si es gratuito (TKT-05)',
  })
  async purchaseProductionTicket(
    @Args('purchaseRequest', { type: () => ProductionTicketPurchaseRequest })
    purchaseRequest: ProductionTicketPurchaseRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseResponse> {
    return this.ticketAdapter.purchaseProductionTicket(
      purchaseRequest,
      requireUserId(context),
    );
  }

  @Query(() => ProductionTicketPurchaseListResponse, {
    description: 'Tickets comprados por el usuario',
  })
  async getMyProductionTicketPurchases(
    @Args('status', { type: () => ProductionTicketPurchaseStatus, nullable: true })
    status: ProductionTicketPurchaseStatus | undefined,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionTicketPurchaseListResponse> {
    return this.ticketAdapter.getMyProductionTicketPurchases(
      requireUserId(context),
      status,
      page,
      limit,
    );
  }
}
