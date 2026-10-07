import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { hasTicketTransferAccount } from 'src/contexts/module_shared/production-limits/production.limits.config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { Production } from '../../domain/entity/production.entity';
import { ProductionArticle } from '../../domain/entity/production-item.entity';
import {
  ProductionTicket,
  ProductionTicketPurchase,
} from '../../domain/entity/production-ticket.entity';
import {
  ProductionLockReason,
  ProductionRole,
  ProductionOwnerType,
} from '../../domain/entity/enum/production.enums';
import {
  ProductionCommissionStatus,
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
  BLOG_TARGET_KEY,
  EMPTY_TICKET_STATS,
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
  buildCommissionPaymentInstructions,
  buildCreatorPaymentInstructions,
  PurchaseAudience,
  toPurchaseResponse,
  toTicketResponse,
} from '../functions/production-ticket.view';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { production_ticket_notification } from 'src/contexts/module_shared/event-emmiter/events';
import {
  ProductionTicketNotificationAudience,
  ProductionTicketNotificationEvent,
  ProductionTicketNotificationPayload,
} from 'src/contexts/module_user/notification/domain/entity/production-ticket.events';

const DUPLICATE_KEY = 11000;
const MAX_PAGE_SIZE = 50;

const NO_REFUND_WARNING =
  'Los tickets no tienen devolución. Una vez que el blog verifica la transferencia, el acceso se habilita por la duración indicada.';

const { pending, active, expired, rejected } =
  ProductionTicketPurchaseStatus;

const pagination = (page: number, limit: number) => ({
  page: Math.max(1, Math.floor(page) || 1),
  limit: Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 10)),
});

/**
 * Tickets de Mis Producciones (§4.2): configuración del creador y compra con
 * dos transferencias. El comprador le transfiere su parte al blog (el staff
 * la verifica y habilita el acceso) y la comisión a Soonpublicité (el admin
 * de la plataforma la controla y puede suspender el acceso si está impaga).
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async getProductionOrFail(productionId: string): Promise<Production> {
    const production = await this.productionRepository.findById(productionId);
    if (!production) throw new NotFoundException('Producción no encontrada');
    return production;
  }

  /** Staff del blog: el dueño, o el creador y los admins del grupo. */
  private async getStaffIds(productionId: string): Promise<string[]> {
    const production = await this.productionRepository.findById(productionId);
    if (!production) return [];
    if (production.getOwnerType !== ProductionOwnerType.Group) {
      return [String(production.getOwner)];
    }
    const roster = await this.productionRepository.findGroupRoster(
      production.getOwner,
    );
    const toId = (member: any) => String(member?._id ?? member);
    return [roster?.creator, ...(roster?.admins ?? [])]
      .filter(Boolean)
      .map(toId);
  }

  /**
   * Avisa de un paso de la venta a las audiencias indicadas. Cada usuario
   * recibe una sola notificación (comprador > staff > admin) y quien hizo la
   * acción no se notifica a sí mismo. Nunca lanza: un aviso que falla no tiene
   * que romper la compra ni el cobro.
   */
  private async notifyPurchase(
    event: ProductionTicketNotificationEvent,
    purchase: ProductionTicketPurchase,
    audiences: ProductionTicketNotificationAudience[],
    actorId?: string,
  ): Promise<void> {
    try {
      const byUser = new Map<string, ProductionTicketNotificationAudience>();
      const add = (
        userIds: string[],
        audience: ProductionTicketNotificationAudience,
      ) =>
        userIds.forEach((userId) => {
          if (userId && userId !== actorId && !byUser.has(userId)) {
            byUser.set(userId, audience);
          }
        });

      if (audiences.includes('buyer')) add([purchase.buyer], 'buyer');
      if (audiences.includes('staff')) {
        add(await this.getStaffIds(purchase.production), 'staff');
      }
      if (audiences.includes('admin')) {
        add(await this.productionRepository.findAdminUserIds(), 'admin');
      }
      if (byUser.size === 0) return;

      const payload: ProductionTicketNotificationPayload = {
        event,
        recipients: Array.from(byUser, ([userId, audience]) => ({
          userId,
          audience,
        })),
        data: {
          purchaseId: purchase._id,
          productionId: purchase.production,
          productionTitle: purchase.productionTitle,
          targetId: purchase.target ?? null,
          targetName: purchase.targetName ?? null,
          amount: purchase.amount,
          currency: purchase.currency,
          creatorPayoutAmount: purchase.creatorPayoutAmount ?? null,
          commissionAmount: purchase.commissionAmount ?? null,
          reason: purchase.statusReason ?? null,
        },
      };
      // emitAsync: en Firebase Functions lo que queda corriendo después de
      // responder se puede congelar.
      await this.eventEmitter.emitAsync(production_ticket_notification, payload);
    } catch (error: any) {
      this.logger.error(
        `Error notifying ${event} of purchase ${purchase._id}: ${error?.message}`,
      );
    }
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
   * grupo, el plan del creator del grupo: GRP-08) y un alias/CBU donde el
   * comprador le transfiere su parte (TKT-11).
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

  /**
   * Un ticket pago sólo se puede poner sobre algo que tenga contenido para
   * vender: el blog o la carpeta con al menos un archivo o artículo adentro, y
   * el artículo con al menos un bloque.
   */
  private async assertTargetHasContent(
    production: Production,
    targetId: string | null,
  ): Promise<void> {
    if (!targetId) {
      if ((production.getFilesCount ?? 0) > 0) return;
      throw new BadRequestException(
        'El blog todavía no tiene contenido. Subí al menos un archivo o artículo antes de ponerle un ticket pago.',
      );
    }
    const [item, subtree] = await Promise.all([
      this.itemRepository.findById(targetId),
      this.itemRepository.findSubtree(targetId),
    ]);
    if (item instanceof ProductionArticle) {
      if ((item.getBlocks ?? []).length > 0) return;
      throw new BadRequestException(
        'El artículo está vacío. Escribí su contenido antes de ponerle un ticket pago.',
      );
    }
    if (subtree.quotaIds.length === 0) {
      throw new BadRequestException(
        'La carpeta está vacía. Agregale al menos un archivo o artículo antes de ponerle un ticket pago.',
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
        ? this.purchaseRepository.countByTargets(production.getId!, [
            ticket.target ?? null,
          ])
        : Promise.resolve(null),
    ]);
    return toTicketResponse(ticket, {
      ...description,
      stats: stats
        ? stats.get(ticket.target ?? BLOG_TARGET_KEY) ?? EMPTY_TICKET_STATS
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
    if (purchase.commissionStatus === ProductionCommissionStatus.unpaid) {
      throw new ForbiddenException(
        'Soonpublicité suspendió esta compra porque la comisión está impaga. Se va a poder habilitar cuando el comprador la pague.',
      );
    }
    const now = new Date();
    const activated = await this.purchaseRepository.transition(
      purchase._id,
      [pending],
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
        'Sólo se puede habilitar una compra pendiente',
      );
    }
    this.logger.log(`Ticket purchase ${purchase._id} activated by ${activatedBy}`);
    await this.notifyPurchase(
      ProductionTicketNotificationEvent.activated,
      activated,
      ['buyer', 'staff'],
      activatedBy,
    );
    return activated;
  }

  private async reject(
    purchase: ProductionTicketPurchase,
    reason: string,
    rejectedBy: string,
  ): Promise<ProductionTicketPurchase> {
    const updated = await this.purchaseRepository.transition(
      purchase._id,
      [pending],
      {
        status: rejected,
        isOpen: false,
        rejectedAt: new Date(),
        rejectedBy,
        statusReason: reason.trim(),
        reviewRequired: false,
      },
    );
    if (!updated) {
      throw new BadRequestException(
        'Sólo se puede rechazar una compra pendiente',
      );
    }
    this.logger.log(`Ticket purchase ${purchase._id} rejected by ${rejectedBy}`);
    await this.notifyPurchase(
      ProductionTicketNotificationEvent.rejected,
      updated,
      ['buyer', 'staff'],
      rejectedBy,
    );
    return updated;
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
    if (config.isPaid) {
      await this.assertCanSellPaid(production);
      await this.assertTargetHasContent(production, targetId);
    }

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
    if (config.isPaid) {
      await this.assertCanSellPaid(production);
      // Sólo al pasar a pago: un ticket que ya era pago se puede seguir
      // editando aunque después se haya vaciado su contenido.
      if (!ticket.isPaid) {
        await this.assertTargetHasContent(production, ticket.target);
      }
    }

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
    const stats = await this.purchaseRepository.countByTargets(
      productionId,
      tickets.map((ticket) => ticket.target ?? null),
    );
    return Promise.all(
      tickets.map(async (ticket) =>
        toTicketResponse(ticket, {
          ...(await this.describeTarget(production, ticket.target)),
          stats:
            stats.get(ticket.target ?? BLOG_TARGET_KEY) ?? EMPTY_TICKET_STATS,
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
    targetId?: string,
  ): Promise<ProductionTicketPurchaseListResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canViewInsights',
    );
    const paging = pagination(page, limit);
    // Con targetId: sólo las ventas de ese contenido. Se filtra por destino y
    // no por ticket para no perder las ventas de un ticket quitado y recreado.
    const filter: ProductionPurchaseListFilter = {
      productionId,
      targetId: targetId || undefined,
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

  /**
   * TKT-07: el creador (o un moderador) verificó que llegó la transferencia
   * al blog y habilita el acceso.
   */
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

  /** El staff rechaza una compra: la transferencia al blog no llegó. */
  async rejectProductionTicketPurchase(
    purchaseId: string,
    reason: string,
    userId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    const production = await this.getProductionOrFail(purchase.production);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    return this.viewPurchase(
      await this.reject(purchase, reason, userId),
      'staff',
    );
  }

  /**
   * TKT-11: alias/CBU al que los compradores transfieren la parte del
   * creador. Sólo el admin del blog cobra.
   */
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
    const split = computeTicketSplit(ticket.price);

    return {
      ticket: await this.buildTicketView(production, ticket, false),
      productionTitle: production.getTitle,
      requiresNoRefundAcceptance: ticket.isPaid,
      noRefundWarning: NO_REFUND_WARNING,
      creatorPaymentInstructions: ticket.isPaid
        ? buildCreatorPaymentInstructions(
            production.getAliasCbu,
            split.creatorPayoutAmount,
            ticket.currency,
          )
        : null,
      commissionPaymentInstructions: ticket.isPaid
        ? buildCommissionPaymentInstructions(
            split.commissionAmount,
            ticket.currency,
          )
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

    // TKT-05: hacen falta las dos cuentas, la del blog y la de Soonpublicité.
    if (
      ticket.isPaid &&
      (!hasTicketTransferAccount() || !production.getAliasCbu)
    ) {
      throw new BadRequestException(
        'La compra de tickets pagos no está disponible por el momento. Intentá más tarde.',
      );
    }

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
        // TKT-05: queda pendiente hasta que el staff verifique su
        // transferencia. Un ticket gratuito habilita el acceso en el momento
        // (sirve para contar visitas).
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
        transferReceiptKey: ticket.isPaid
          ? request.transferReceiptKey?.trim() || null
          : null,
        commissionReceiptKey: ticket.isPaid
          ? request.commissionReceiptKey?.trim() || null
          : null,
        commissionStatus: ticket.isPaid
          ? ProductionCommissionStatus.pending
          : ProductionCommissionStatus.notApplicable,
        commissionUpdatedAt: null,
        commissionUpdatedBy: null,
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
        // TKT-09: el ticket pago obliga a reseñar.
        reviewRequired: ticket.isPaid,
        firstAccessAt: null,
        reviewedAt: null,
      });
      this.logger.log(
        `Ticket purchase ${purchaseId} created by ${userId} (${ticket.isPaid ? 'paid' : 'free'})`,
      );
      const created = await this.getPurchaseOrFail(purchaseId);
      // Los tickets gratuitos no avisan: son visitas, no ventas.
      if (created.isPaid) {
        await this.notifyPurchase(
          ProductionTicketNotificationEvent.purchased,
          created,
          ['buyer', 'staff', 'admin'],
        );
      }
      return this.viewPurchase(created, 'buyer');
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
      commissionStatus: filters?.commissionStatus,
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

  /**
   * TKT-06: el admin controla la comisión que el comprador le transfirió a
   * Soonpublicité. Marcarla impaga suspende el acceso (o impide habilitarlo)
   * hasta que se marque cobrada; el vencimiento del ticket sigue corriendo.
   */
  async setProductionTicketCommissionStatus(
    purchaseId: string,
    status: ProductionCommissionStatus,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    if (
      status !== ProductionCommissionStatus.paid &&
      status !== ProductionCommissionStatus.unpaid
    ) {
      throw new BadRequestException(
        'La comisión sólo se puede marcar como cobrada o impaga',
      );
    }
    const purchase = await this.getPurchaseOrFail(purchaseId);
    const updated = purchase.isPaid
      ? await this.purchaseRepository.transition(
          purchaseId,
          [pending, active, expired],
          {
            commissionStatus: status,
            commissionUpdatedAt: new Date(),
            commissionUpdatedBy: adminId,
          },
        )
      : null;
    if (!updated) {
      throw new BadRequestException(
        'Sólo se controla la comisión de un ticket pago que no fue rechazado ni cancelado',
      );
    }
    this.logger.log(
      `Ticket purchase ${purchaseId} commission set to ${status} by ${adminId}`,
    );

    // Sólo se avisa cuando cambia el acceso: se suspende o se restablece.
    const wasUnpaid =
      purchase.commissionStatus === ProductionCommissionStatus.unpaid;
    const isUnpaid = status === ProductionCommissionStatus.unpaid;
    if (updated.status !== expired && wasUnpaid !== isUnpaid) {
      await this.notifyPurchase(
        isUnpaid
          ? ProductionTicketNotificationEvent.suspended
          : ProductionTicketNotificationEvent.restored,
        updated,
        ['buyer', 'staff'],
        adminId,
      );
    }
    return this.viewPurchase(updated, 'admin');
  }

  async rejectProductionTicketPurchaseAsAdmin(
    purchaseId: string,
    reason: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    return this.viewPurchase(
      await this.reject(purchase, reason, adminId),
      'admin',
    );
  }

  /**
   * Factura de la comisión (patrón attachFacturaToInvoice). Es para el
   * comprador, que es quien le paga la comisión a Soonpublicité.
   */
  async attachFacturaToProductionTicketPurchase(
    purchaseId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse> {
    const purchase = await this.getPurchaseOrFail(purchaseId);
    if (
      !purchase.isPaid ||
      purchase.commissionStatus !== ProductionCommissionStatus.paid
    ) {
      throw new BadRequestException(
        'Sólo se factura un ticket pago con la comisión cobrada',
      );
    }
    const updated = await this.purchaseRepository.updateById(purchaseId, {
      facturaUrl,
      facturaUploadedAt: new Date(),
      facturaUploadedBy: adminId,
    });
    await this.notifyPurchase(
      ProductionTicketNotificationEvent.facturaAttached,
      updated!,
      ['buyer'],
      adminId,
    );
    return this.viewPurchase(updated!, 'admin');
  }
}
