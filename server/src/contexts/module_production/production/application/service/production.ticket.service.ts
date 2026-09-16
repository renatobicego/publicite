import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionTicket,
  ProductionTicketPurchase,
} from '../../domain/entity/production-ticket.entity';
import {
  ProductionLockReason,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import {
  ProductionPayoutStatus,
  ProductionTicketPurchaseStatus,
} from '../../domain/entity/enum/production-ticket.enums';
import {
  ProductionTicketCreateRequest,
  ProductionTicketPurchaseFilters,
  ProductionTicketPurchaseRequest,
  ProductionTicketUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-ticket.request';
import {
  ProductionTicketCheckoutResponse,
  ProductionTicketPurchaseListResponse,
  ProductionTicketPurchaseResponse,
  ProductionTicketResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production-ticket.response';
import { ProductionResponse } from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionItemRepositoryInterface } from '../../domain/repository/production-item.repository.interface';
import {
  ProductionPurchaseListFilter,
  ProductionTicketPurchaseRepositoryInterface,
  ProductionTicketRepositoryInterface,
} from '../../domain/repository/production-ticket.repository.interface';
import { ProductionServiceInterface } from '../../domain/service/production.service.interface';
import { ProductionTicketServiceInterface } from '../../domain/service/production-ticket.service.interface';
import { ProductionAccessService } from './production.access.service';
import {
  computeTicketExpiration,
  computeTicketSplit,
  normalizeAliasCbu,
  validateTicketConfig,
} from '../functions/production.tickets';
import {
  buildPaymentInstructions,
  PurchaseAudience,
  toPurchaseResponse,
  toTicketResponse,
} from '../functions/production-ticket.view';

const DUPLICATE_KEY = 11000;
const MAX_PAGE_SIZE = 50;

const NO_REFUND_WARNING =
  'Los tickets no tienen devolución. Una vez confirmado el pago, el acceso se habilita por la duración indicada.';

const { pending, confirmed, active, expired, rejected } =
  ProductionTicketPurchaseStatus;

const pagination = (page: number, limit: number) => ({
  page: Math.max(1, Math.floor(page) || 1),
  limit: Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 10)),
});

/**
 * Tickets de Mis Producciones (§4.2): configuración del creador, compra por
 * transferencia, confirmación manual del admin y liquidación (10% / 90%).
 */
@Injectable()
export class ProductionTicketService implements ProductionTicketServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('ProductionItemRepositoryInterface')
    private readonly itemRepository: ProductionItemRepositoryInterface,
    @Inject('ProductionTicketRepositoryInterface')
    private readonly ticketRepository: ProductionTicketRepositoryInterface,
    @Inject('ProductionTicketPurchaseRepositoryInterface')
    private readonly purchaseRepository: ProductionTicketPurchaseRepositoryInterface,
    @Inject('ProductionServiceInterface')
    private readonly productionService: ProductionServiceInterface,
    private readonly accessService: ProductionAccessService,
  ) {}

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async getProductionOrFail(productionId: string): Promise<Production> {
    const production = await this.productionRepository.findById(productionId);
    if (!production) throw new NotFoundException('Producción no encontrada');
    return production;
  }

  private async getTicketOrFail(ticketId: string): Promise<ProductionTicket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  private async getPurchaseOrFail(
    purchaseId: string,
  ): Promise<ProductionTicketPurchase> {
    const purchase = await this.purchaseRepository.findById(purchaseId);
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    return purchase;
  }

  /** Nombre y cantidad de archivos que incluye el ticket (TKT-04). */
  private async describeTarget(
    production: Production,
    targetId: string | null,
  ): Promise<{ targetName: string | null; filesCount: number }> {
    if (!targetId) {
      return { targetName: null, filesCount: production.getFilesCount ?? 0 };
    }
    const [item, subtree] = await Promise.all([
      this.itemRepository.findById(targetId),
      this.itemRepository.findSubtree(targetId),
    ]);
    return {
      targetName: item?.getName ?? null,
      filesCount: subtree.quotaIds.length,
    };
  }

  /**
   * Un ticket pago exige plan pago del creator (PLN-03, TKT-10; en blogs de
   * grupo, el plan del creator del grupo: GRP-08) y un alias/CBU donde
   * liquidarle el 90% (TKT-11).
   */
  private async assertCanSellPaid(production: Production): Promise<void> {
    const limits = await this.accessService.getCreatorLimits(production);
    if (!limits.canSellPaidTickets) {
      throw new ForbiddenException(
        'Tu plan gratuito sólo permite tickets gratuitos. Mejorá tu plan para cobrar con tickets pagos.',
      );
    }
    if (!production.getAliasCbu) {
      throw new BadRequestException(
        'Cargá el alias o CBU de cobro del blog antes de crear tickets pagos',
      );
    }
  }

  private async buildTicketView(
    production: Production,
    ticket: ProductionTicket,
    withStats: boolean,
  ): Promise<ProductionTicketResponse> {
    const [description, stats] = await Promise.all([
      this.describeTarget(production, ticket.target),
      withStats
        ? this.purchaseRepository.countByTickets([ticket._id])
        : Promise.resolve(null),
    ]);
    return toTicketResponse(ticket, {
      ...description,
      stats: stats
        ? stats.get(ticket._id) ?? { purchases: 0, active: 0, revenue: 0 }
        : null,
    });
  }

  private async toPurchaseList(
    result: { purchases: ProductionTicketPurchase[]; total: number },
    page: number,
    limit: number,
    audience: PurchaseAudience,
  ): Promise<ProductionTicketPurchaseListResponse> {
    const buyers =
      audience === 'buyer'
        ? new Map()
        : await this.productionRepository.findUsersInfo(
            result.purchases.map((purchase) => purchase.buyer),
          );
    return {
      purchases: result.purchases.map((purchase) =>
        toPurchaseResponse(purchase, audience, buyers.get(purchase.buyer)),
      ),
      total: result.total,
      hasMore: page * limit < result.total,
    };
  }

  private async viewPurchase(
    purchase: ProductionTicketPurchase,
    audience: PurchaseAudience,
  ): Promise<ProductionTicketPurchaseResponse> {
    const buyers =
      audience === 'buyer'
        ? new Map()
        : await this.productionRepository.findUsersInfo([purchase.buyer]);
    return toPurchaseResponse(purchase, audience, buyers.get(purchase.buyer));
  }

  private async activate(
    purchase: ProductionTicketPurchase,
    activatedBy: string,
  ): Promise<ProductionTicketPurchase> {
    const now = new Date();
    const activated = await this.purchaseRepository.transition(
      purchase._id,
      [confirmed],
      {
        status: active,
        activatedAt: now,
        activatedBy,
        expiresAt: computeTicketExpiration(
          now,
          purchase.durationHours,
          purchase.untilClose,
        ),
      },
    );
    if (!activated) {
      throw new BadRequestException(
        'Sólo se puede habilitar una compra con el pago confirmado',
      );
    }
    this.logger.log(`Ticket purchase ${purchase._id} activated by ${activatedBy}`);
    return activated;
  }

  // ---------------------------------------------------------------------------
  // Staff del blog: Page de Ticket (TKT-01..03, TKT-07, TKT-11)
  // ---------------------------------------------------------------------------

  async createProductionTicket(
    request: ProductionTicketCreateRequest,
    userId: string,
  ): Promise<ProductionTicketResponse> {
    const production = await this.getProductionOrFail(request.productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );

    const targetId = request.targetId ?? null;
    if (targetId) {
      const target = await this.itemRepository.findById(targetId);
      if (!target || target.getProduction !== production.getId) {
        throw new BadRequestException('El contenido del ticket no es válido');
      }
    }

    const config = validateTicketConfig(request);
    if (config.isPaid) await this.assertCanSellPaid(production);

    try {
      const ticketId = await this.ticketRepository.create({
        production: production.getId!,
        target: targetId,
        ...config,
        currency: request.currency ?? 'ARS',
        createdBy: userId,
      });
      const ticket = await this.getTicketOrFail(ticketId);
      return this.buildTicketView(production, ticket, true);
    } catch (error: any) {
      if (error?.code === DUPLICATE_KEY) {
        throw new BadRequestException(
          'Ese contenido ya tiene un ticket. Editalo en lugar de crear otro.',
        );
      }
      throw error;
    }
  }

  async updateProductionTicket(
    ticketId: string,
    request: ProductionTicketUpdateRequest,
    userId: string,
  ): Promise<ProductionTicketResponse> {
    const ticket = await this.getTicketOrFail(ticketId);
    const production = await this.getProductionOrFail(ticket.production);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );

    // TKT-02: el toggle cambia toda la carpeta de inmediato, porque los hijos
    // heredan este ticket.
    const config = validateTicketConfig({
      isPaid: request.isPaid ?? ticket.isPaid,
      price: request.price ?? ticket.price,
      durationHours:
        request.durationHours !== undefined
          ? request.durationHours
          : ticket.durationHours,
      untilClose: request.untilClose ?? ticket.untilClose,
    });
    if (config.isPaid) await this.assertCanSellPaid(production);

    const updated = await this.ticketRepository.updateById(ticketId, {
      ...config,
      currency: request.currency ?? ticket.currency,
    });
    return this.buildTicketView(production, updated!, true);
  }

  async deleteProductionTicket(ticketId: string, userId: string): Promise<void> {
    const ticket = await this.getTicketOrFail(ticketId);
    const production = await this.getProductionOrFail(ticket.production);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    // Las compras quedan como registro contable (tienen copia de los datos).
    await this.ticketRepository.deleteById(ticketId);
  }

  async getProductionTickets(
    productionId: string,
    userId: string,
  ): Promise<ProductionTicketResponse[]> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    const tickets = await this.ticketRepository.findByProduction(productionId);
    const stats = await this.purchaseRepository.countByTickets(
      tickets.map((ticket) => ticket._id),
    );
    return Promise.all(
      tickets.map(async (ticket) =>
        toTicketResponse(ticket, {
          ...(await this.describeTarget(production, ticket.target)),
          stats: stats.get(ticket._id) ?? { purchases: 0, active: 0, revenue: 0 },
        }),
      ),
    );
  }

  async getProductionTicketSales(
    productionId: string,
    userId: string,
    status: ProductionTicketPurchaseStatus | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionTicketPurchaseListResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canViewInsights',
    );
    const paging = pagination(page, limit);
    const filter: ProductionPurchaseListFilter = {
      productionId,
      statuses: status ? [status] : undefined,
    };
    await this.purchaseRepository.expireOverdue(filter, new Date());
    const result = await this.purchaseRepository.list(
      filter,
      paging.page,
      paging.limit,
    );
    return this.toPurchaseList(result, paging.page, paging.limit, 'staff');
  }

  /** TKT-07: el creador (o un moderador) habilita el acceso ya pagado. */
  async activateProductionTicketPurchase(
    purchaseId: string,
    userId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    const production = await this.getProductionOrFail(purchase.production);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    return this.viewPurchase(await this.activate(purchase, userId), 'staff');
  }

  /** TKT-11: alias/CBU donde se liquida el 90%. Sólo el admin del blog cobra. */
  async setProductionPayoutAlias(
    productionId: string,
    aliasCbu: string,
    userId: string,
  ): Promise<ProductionResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManagePayout',
    );
    await this.productionRepository.updateById(productionId, {
      aliasCbu: normalizeAliasCbu(aliasCbu),
    });
    return this.productionService.findProductionById(productionId, userId);
  }

  // ---------------------------------------------------------------------------
  // Visitante: compra por transferencia (TKT-04/05)
  // ---------------------------------------------------------------------------

  /**
   * Valida que el visitante pueda comprar: ve el blog y el contenido, no es
   * staff ni miembro, y no tiene una reseña pendiente (REV-02).
   */
  private async assertCanBuy(
    production: Production,
    ticket: ProductionTicket,
    userId: string,
  ): Promise<void> {
    const scope = await this.accessService.buildViewerScope(userId);
    if (scope.pendingReviewProductionId) {
      throw new ForbiddenException(
        'Tenés una reseña pendiente. Dejala para poder comprar nuevos tickets.',
      );
    }

    const viewer = await this.accessService.contextFor(production, scope);
    if (viewer.role !== ProductionRole.visitor) {
      throw new BadRequestException('Ya tenés acceso a este contenido');
    }

    const decision = this.accessService.evaluateProduction(production, viewer);
    if (!decision.listed) throw new NotFoundException('Ticket no encontrado');
    if (decision.lockReason === ProductionLockReason.accessKey) {
      throw new ForbiddenException(
        'Ingresá la clave del blog antes de comprar un ticket',
      );
    }
    if (!decision.canViewContent) {
      throw new ForbiddenException('No podés comprar tickets de este blog');
    }

    if (ticket.target) {
      const target = await this.accessService.evaluateItemById(
        production,
        ticket.target,
        viewer,
      );
      if (!target?.decision.listed) {
        throw new NotFoundException('Ticket no encontrado');
      }
    }
  }

  async getProductionTicketCheckout(
    ticketId: string,
    userId: string,
  ): Promise<ProductionTicketCheckoutResponse> {
    const ticket = await this.getTicketOrFail(ticketId);
    const production = await this.getProductionOrFail(ticket.production);
    await this.assertCanBuy(production, ticket, userId);

    await this.purchaseRepository.expireOverdue(
      { ticketId, buyerId: userId },
      new Date(),
    );
    const existing = await this.purchaseRepository.findOpen(ticketId, userId);

    return {
      ticket: await this.buildTicketView(production, ticket, false),
      productionTitle: production.getTitle,
      requiresNoRefundAcceptance: ticket.isPaid,
      noRefundWarning: NO_REFUND_WARNING,
      paymentInstructions: ticket.isPaid
        ? buildPaymentInstructions(ticket.price, ticket.currency)
        : null,
      existingPurchase: existing
        ? toPurchaseResponse(existing, 'buyer')
        : null,
    };
  }

  async purchaseProductionTicket(
    request: ProductionTicketPurchaseRequest,
    userId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const ticket = await this.getTicketOrFail(request.ticketId);
    const production = await this.getProductionOrFail(ticket.production);
    await this.assertCanBuy(production, ticket, userId);

    // TKT-04: aceptación explícita de que no hay devoluciones.
    if (ticket.isPaid && request.acceptNoRefund !== true) {
      throw new BadRequestException(
        'Tenés que aceptar que los tickets no tienen devolución',
      );
    }

    const now = new Date();
    await this.purchaseRepository.expireOverdue(
      { ticketId: ticket._id, buyerId: userId },
      now,
    );
    if (await this.purchaseRepository.findOpen(ticket._id, userId)) {
      throw new BadRequestException(
        'Ya tenés una compra pendiente o activa de este ticket',
      );
    }

    const { targetName, filesCount } = await this.describeTarget(
      production,
      ticket.target,
    );
    const split = ticket.isPaid
      ? computeTicketSplit(ticket.price)
      : { commissionPercent: 0, commissionAmount: 0, creatorPayoutAmount: 0 };

    try {
      const purchaseId = await this.purchaseRepository.create({
        ticket: ticket._id,
        production: production.getId!,
        target: ticket.target,
        buyer: userId,
        creator: production.getCreator,
        // TKT-05: el pago queda pendiente de confirmación. Un ticket gratuito
        // habilita el acceso en el momento (sirve para contar visitas).
        status: ticket.isPaid ? pending : active,
        isOpen: true,
        isPaid: ticket.isPaid,
        amount: ticket.isPaid ? ticket.price : 0,
        currency: ticket.currency,
        ...split,
        durationHours: ticket.durationHours,
        untilClose: ticket.untilClose,
        filesCount,
        productionTitle: production.getTitle,
        targetName,
        payoutAliasCbu: ticket.isPaid ? production.getAliasCbu ?? null : null,
        acceptedNoRefund: !!request.acceptNoRefund,
        acceptedAt: request.acceptNoRefund ? now : null,
        transferReference: request.transferReference?.trim() || null,
        confirmedAt: null,
        confirmedBy: null,
        activatedAt: ticket.isPaid ? null : now,
        activatedBy: ticket.isPaid ? null : 'system',
        expiresAt: ticket.isPaid
          ? null
          : computeTicketExpiration(now, ticket.durationHours, ticket.untilClose),
        expiredAt: null,
        rejectedAt: null,
        rejectedBy: null,
        statusReason: null,
        facturaUrl: null,
        facturaUploadedAt: null,
        facturaUploadedBy: null,
        payoutStatus: ProductionPayoutStatus.notApplicable,
        payoutAt: null,
        payoutBy: null,
        // TKT-09: el ticket pago obliga a reseñar.
        reviewRequired: ticket.isPaid,
        firstAccessAt: null,
        reviewedAt: null,
      });
      this.logger.log(
        `Ticket purchase ${purchaseId} created by ${userId} (${ticket.isPaid ? 'paid' : 'free'})`,
      );
      return this.viewPurchase(
        await this.getPurchaseOrFail(purchaseId),
        'buyer',
      );
    } catch (error: any) {
      if (error?.code === DUPLICATE_KEY) {
        throw new BadRequestException(
          'Ya tenés una compra pendiente o activa de este ticket',
        );
      }
      throw error;
    }
  }

  async getMyProductionTicketPurchases(
    userId: string,
    status: ProductionTicketPurchaseStatus | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionTicketPurchaseListResponse> {
    const paging = pagination(page, limit);
    const filter: ProductionPurchaseListFilter = {
      buyerId: userId,
      statuses: status ? [status] : undefined,
    };
    await this.purchaseRepository.expireOverdue(filter, new Date());
    const result = await this.purchaseRepository.list(
      filter,
      paging.page,
      paging.limit,
    );
    return this.toPurchaseList(result, paging.page, paging.limit, 'buyer');
  }

  // ---------------------------------------------------------------------------
  // Admin de la plataforma (TKT-06, TKT-11)
  // ---------------------------------------------------------------------------

  async getProductionTicketPurchasesAdmin(
    filters: ProductionTicketPurchaseFilters | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionTicketPurchaseListResponse> {
    const paging = pagination(page, limit);
    const filter: ProductionPurchaseListFilter = {
      productionId: filters?.productionId,
      buyerId: filters?.buyerId,
      statuses: filters?.status ? [filters.status] : undefined,
      payoutStatus: filters?.payoutStatus,
      hasFactura: filters?.hasFactura,
      isPaid: filters?.isPaid,
    };
    await this.purchaseRepository.expireOverdue(filter, new Date());
    const result = await this.purchaseRepository.list(
      filter,
      paging.page,
      paging.limit,
    );
    return this.toPurchaseList(result, paging.page, paging.limit, 'admin');
  }

  /** TKT-06: el admin verificó la transferencia. */
  async confirmProductionTicketPurchase(
    purchaseId: string,
    adminId: string,
    activate: boolean,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    let updated = await this.purchaseRepository.transition(
      purchaseId,
      [pending],
      {
        status: confirmed,
        confirmedAt: new Date(),
        confirmedBy: adminId,
        payoutStatus: purchase.isPaid
          ? ProductionPayoutStatus.pending
          : ProductionPayoutStatus.notApplicable,
      },
    );
    if (!updated) {
      throw new BadRequestException(
        'Sólo se puede confirmar una compra pendiente',
      );
    }
    if (activate) updated = await this.activate(updated, adminId);
    return this.viewPurchase(updated, 'admin');
  }

  async rejectProductionTicketPurchase(
    purchaseId: string,
    reason: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    await this.getPurchaseOrFail(purchaseId);
    const updated = await this.purchaseRepository.transition(
      purchaseId,
      [pending, confirmed],
      {
        status: rejected,
        isOpen: false,
        rejectedAt: new Date(),
        rejectedBy: adminId,
        statusReason: reason.trim(),
        payoutStatus: ProductionPayoutStatus.notApplicable,
        reviewRequired: false,
      },
    );
    if (!updated) {
      throw new BadRequestException(
        'Sólo se puede rechazar una compra pendiente o confirmada',
      );
    }
    return this.viewPurchase(updated, 'admin');
  }

  async activateProductionTicketPurchaseAsAdmin(
    purchaseId: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    return this.viewPurchase(await this.activate(purchase, adminId), 'admin');
  }

  /** Factura del 10% de comisión (patrón attachFacturaToInvoice). */
  async attachFacturaToProductionTicketPurchase(
    purchaseId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    if (!purchase.isPaid || ![confirmed, active, expired].includes(purchase.status)) {
      throw new BadRequestException(
        'Sólo se factura un ticket pago con el pago confirmado',
      );
    }
    const updated = await this.purchaseRepository.updateById(purchaseId, {
      facturaUrl,
      facturaUploadedAt: new Date(),
      facturaUploadedBy: adminId,
    });
    return this.viewPurchase(updated!, 'admin');
  }

  /** Liquidación del 90% al creador hecha (TKT-06). */
  async markProductionTicketPayoutDone(
    purchaseId: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    const updated = purchase.isPaid
      ? await this.purchaseRepository.transition(
          purchaseId,
          [confirmed, active, expired],
          {
            payoutStatus: ProductionPayoutStatus.paid,
            payoutAt: new Date(),
            payoutBy: adminId,
          },
        )
      : null;
    if (!updated) {
      throw new BadRequestException(
        'Sólo se liquida un ticket pago con el pago confirmado',
      );
    }
    return this.viewPurchase(updated, 'admin');
  }
}
