import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionArticle,
  ProductionFile,
  ProductionItem,
} from '../../domain/entity/production-item.entity';
import { ProductionTicket } from '../../domain/entity/production-ticket.entity';
import {
  ProductionBulkAction,
  ProductionPriceChangeMode,
} from '../../domain/entity/enum/production-seudobase.enums';
import {
  ProductionBulkDeleteInput,
  ProductionBulkPriceInput,
  ProductionBulkVisibilityInput,
  ProductionSeudoBaseFilters,
  SEUDOBASE_MAX_ITEMS,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-seudobase.request';
import {
  ProductionAuditLogResponse,
  ProductionBulkResultResponse,
  ProductionSeudoBaseResponse,
  ProductionSeudoBaseRowResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production-seudobase.response';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionItemRepositoryInterface } from '../../domain/repository/production-item.repository.interface';
import { ProductionTicketRepositoryInterface } from '../../domain/repository/production-ticket.repository.interface';
import { ProductionAuditRepositoryInterface } from '../../domain/repository/production-audit.repository.interface';
import { ProductionSeudoBaseServiceInterface } from '../../domain/service/production-seudobase.service.interface';
import { ProductionAccessService } from './production.access.service';
import { ProductionCascadeService } from './production.cascade.service';
import {
  resolveEffectiveTicket,
  resolveEffectiveVisibility,
} from '../functions/production.access';
import { buildProductionSearchRegex } from '../functions/production.text';
import { toTicketSummary } from '../functions/production-ticket.view';

const MAX_PAGE_SIZE = 100;
const round2 = (value: number) => Math.round(value * 100) / 100;

@Injectable()
export class ProductionSeudoBaseService
  implements ProductionSeudoBaseServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('ProductionItemRepositoryInterface')
    private readonly itemRepository: ProductionItemRepositoryInterface,
    @Inject('ProductionTicketRepositoryInterface')
    private readonly ticketRepository: ProductionTicketRepositoryInterface,
    @Inject('ProductionAuditRepositoryInterface')
    private readonly auditRepository: ProductionAuditRepositoryInterface,
    private readonly accessService: ProductionAccessService,
    private readonly cascadeService: ProductionCascadeService,
  ) {}

  private async inTransaction<T>(
    work: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  private async getProductionOrFail(productionId: string): Promise<Production> {
    const production = await this.productionRepository.findById(productionId);
    if (!production) throw new NotFoundException('Producción no encontrada');
    return production;
  }

  /**
   * Valida una operación masiva: confirmación explícita (SB-02/03), tope de
   * ítems y que todos pertenezcan al blog.
   */
  private async loadBulkTargets(
    production: Production,
    itemIds: string[],
    confirm: boolean,
  ): Promise<ProductionItem[]> {
    if (confirm !== true) {
      throw new BadRequestException(
        'Confirmá la operación masiva antes de aplicarla',
      );
    }
    const ids = Array.from(new Set(itemIds ?? []));
    if (ids.length === 0) {
      throw new BadRequestException('Seleccioná al menos un elemento');
    }
    if (ids.length > SEUDOBASE_MAX_ITEMS) {
      throw new BadRequestException(
        `Una operación masiva admite hasta ${SEUDOBASE_MAX_ITEMS} elementos`,
      );
    }
    const items = await this.itemRepository.findByIds(production.getId!, ids);
    if (items.length !== ids.length) {
      throw new BadRequestException(
        'Algunos elementos seleccionados no pertenecen a este blog',
      );
    }
    return items;
  }

  // ---------------------------------------------------------------------------
  // Vista tipo Excel (SB-01)
  // ---------------------------------------------------------------------------

  async getProductionSeudoBase(
    productionId: string,
    userId: string,
    filters: ProductionSeudoBaseFilters | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionSeudoBaseResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(production, userId, 'canBulkEdit');

    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 20));
    const searchRegex = buildProductionSearchRegex(filters?.searchTerm);
    if (filters?.searchTerm && !searchRegex) {
      return { rows: [], total: 0, hasMore: false };
    }

    const [result, folders, tickets] = await Promise.all([
      this.itemRepository.search(
        {
          productionId,
          kinds: filters?.kinds,
          parentId: filters?.parentId,
          searchRegex,
        },
        safePage,
        safeLimit,
      ),
      this.itemRepository.findAllFolders(productionId),
      this.ticketRepository.findByProduction(productionId),
    ]);

    // Las herencias se resuelven en memoria con todas las carpetas del blog.
    const folderById = new Map(folders.map((folder) => [folder.getId!, folder]));
    const ticketByTarget = new Map<string | null, ProductionTicket>(
      tickets.map((ticket) => [ticket.target, ticket]),
    );
    const chainOf = (item: ProductionItem): ProductionItem[] => {
      const chain = [item];
      let parentId = item.getParent;
      while (parentId && chain.length < 60) {
        const parent = folderById.get(parentId);
        if (!parent) break;
        chain.push(parent);
        parentId = parent.getParent;
      }
      return chain;
    };

    const rows: ProductionSeudoBaseRowResponse[] = result.items.map((item) => {
      const chain = chainOf(item);
      const ownTicket = ticketByTarget.get(item.getId!) ?? null;
      const effectiveTicket = resolveEffectiveTicket(
        chain.map((node) => node.getId!),
        tickets,
      );
      const isContent =
        item instanceof ProductionFile || item instanceof ProductionArticle;
      return {
        _id: item.getId!,
        kind: item.getKind,
        name: item.getName,
        fileName: isContent ? item.getFileName : null,
        fileType: item instanceof ProductionFile ? item.getFileType : null,
        key: item instanceof ProductionFile ? item.getKey : null,
        parent: item.getParent,
        path: chain
          .slice(1)
          .reverse()
          .map((node) => node.getName)
          .join(' / ') || null,
        visibility: (item.getVisibility as any) ?? null,
        effectiveVisibility: resolveEffectiveVisibility(
          chain.map((node) => node.getVisibility),
          production.getVisibility,
        ) as any,
        ownTicket: ownTicket ? toTicketSummary(ownTicket) : null,
        effectiveTicket: effectiveTicket ? toTicketSummary(effectiveTicket) : null,
        price: effectiveTicket ? effectiveTicket.price : null,
        moderationStatus: item.getModerationStatus!,
        createdAt: item.getCreatedAt,
        updatedAt: item.getUpdatedAt,
      };
    });

    return {
      rows,
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  // ---------------------------------------------------------------------------
  // Operaciones masivas (SB-02/03)
  // ---------------------------------------------------------------------------

  async bulkUpdateProductionPrices(
    input: ProductionBulkPriceInput,
    userId: string,
  ): Promise<ProductionBulkResultResponse> {
    const production = await this.getProductionOrFail(input.productionId);
    await this.accessService.assertPermission(production, userId, 'canBulkEdit');
    const items = await this.loadBulkTargets(
      production,
      input.itemIds,
      input.confirm,
    );

    if (!Number.isFinite(input.value)) {
      throw new BadRequestException('El valor del cambio de precio no es válido');
    }
    if (
      input.mode === ProductionPriceChangeMode.percentage &&
      input.value <= -100
    ) {
      throw new BadRequestException('El porcentaje tiene que ser mayor a -100');
    }

    const tickets = await this.ticketRepository.findByProduction(
      production.getId!,
    );
    const ticketByTarget = new Map(tickets.map((ticket) => [ticket.target, ticket]));

    const updates: { ticketId: string; price: number }[] = [];
    const changes: { itemId: string; before: number; after: number }[] = [];
    const skipped: string[] = [];

    for (const item of items) {
      const ticket = ticketByTarget.get(item.getId!);
      // Sólo cambia el precio de los ítems con ticket pago propio.
      if (!ticket || !ticket.isPaid) {
        skipped.push(item.getId!);
        continue;
      }
      const price =
        input.mode === ProductionPriceChangeMode.percentage
          ? round2(ticket.price * (1 + input.value / 100))
          : round2(input.value);
      if (!(price > 0)) {
        throw new BadRequestException(
          'El precio resultante tiene que ser mayor a 0',
        );
      }
      updates.push({ ticketId: ticket._id, price });
      changes.push({ itemId: item.getId!, before: ticket.price, after: price });
    }

    const auditId = await this.inTransaction(async (session) => {
      await this.ticketRepository.setPrices(updates, session);
      return this.auditRepository.create(
        {
          production: production.getId!,
          actor: userId,
          action: ProductionBulkAction.price,
          itemIds: items.map((item) => item.getId!),
          affectedCount: updates.length,
          details: JSON.stringify({
            mode: input.mode,
            value: input.value,
            changes,
            skipped,
          }),
        },
        session,
      );
    });

    this.logger.log(
      `Bulk price on production ${production.getId}: ${updates.length} tickets by ${userId}`,
    );
    return {
      action: ProductionBulkAction.price,
      requested: items.length,
      affected: updates.length,
      skipped,
      auditId,
    };
  }

  async bulkUpdateProductionVisibility(
    input: ProductionBulkVisibilityInput,
    userId: string,
  ): Promise<ProductionBulkResultResponse> {
    const production = await this.getProductionOrFail(input.productionId);
    await this.accessService.assertPermission(production, userId, 'canBulkEdit');
    const items = await this.loadBulkTargets(
      production,
      input.itemIds,
      input.confirm,
    );
    const ids = items.map((item) => item.getId!);
    const visibility = input.visibility ?? null;

    const auditId = await this.inTransaction(async (session) => {
      await this.itemRepository.setVisibility(
        production.getId!,
        ids,
        visibility,
        session,
      );
      return this.auditRepository.create(
        {
          production: production.getId!,
          actor: userId,
          action: ProductionBulkAction.visibility,
          itemIds: ids,
          affectedCount: ids.length,
          details: JSON.stringify({
            visibility,
            before: items.map((item) => ({
              itemId: item.getId,
              visibility: item.getVisibility,
            })),
          }),
        },
        session,
      );
    });

    return {
      action: ProductionBulkAction.visibility,
      requested: ids.length,
      affected: ids.length,
      skipped: [],
      auditId,
    };
  }

  async bulkDeleteProductionItems(
    input: ProductionBulkDeleteInput,
    userId: string,
  ): Promise<ProductionBulkResultResponse> {
    const production = await this.getProductionOrFail(input.productionId);
    await this.accessService.assertPermission(production, userId, 'canBulkEdit');
    const items = await this.loadBulkTargets(
      production,
      input.itemIds,
      input.confirm,
    );
    const ids = items.map((item) => item.getId!);

    const { auditId, deleted } = await this.inTransaction(async (session) => {
      const result = await this.cascadeService.deleteItems(
        production,
        ids,
        session,
      );
      const id = await this.auditRepository.create(
        {
          production: production.getId!,
          actor: userId,
          action: ProductionBulkAction.delete,
          itemIds: ids,
          affectedCount: ids.length,
          details: JSON.stringify({
            deleted: items.map((item) => ({
              itemId: item.getId,
              kind: item.getKind,
              name: item.getName,
            })),
            deletedNodes: result.deletedIds.length,
            freedQuota: result.freedQuota,
          }),
        },
        session,
      );
      return { auditId: id, deleted: result };
    });

    this.logger.log(
      `Bulk delete on production ${production.getId}: ${deleted.deletedIds.length} nodes by ${userId}`,
    );
    return {
      action: ProductionBulkAction.delete,
      requested: ids.length,
      affected: ids.length,
      skipped: [],
      auditId,
    };
  }

  async getProductionAuditLog(
    productionId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProductionAuditLogResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canViewInsights',
    );
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 20));
    const { entries, total } = await this.auditRepository.list(
      productionId,
      safePage,
      safeLimit,
    );
    const actors = await this.productionRepository.findUsersInfo(
      entries.map((entry) => entry.actor),
    );
    return {
      entries: entries.map((entry) => {
        const actor = actors.get(entry.actor);
        if (!actor) return { ...entry, actorInfo: null };
        // El email no se expone al staff del blog.
        const { email: _email, ...publicInfo } = actor;
        return { ...entry, actorInfo: publicInfo };
      }),
      total,
      hasMore: safePage * safeLimit < total,
    };
  }
}
