import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { getReportsHideThreshold } from 'src/contexts/module_shared/production-limits/production.limits.config';
import {
  ProductionModerationStatus,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import {
  ProductionModerationAction,
  ProductionReportStatus,
} from '../../domain/entity/enum/production-report.enums';
import {
  ProductionModerationInput,
  ProductionReportInput,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-report.request';
import {
  ProductionModerationResultResponse,
  ProductionReportDetailResponse,
  ProductionReportResponse,
  ProductionReportTargetListResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production-report.response';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionItemRepositoryInterface } from '../../domain/repository/production-item.repository.interface';
import { ProductionReportRepositoryInterface } from '../../domain/repository/production-report.repository.interface';
import { ProductionModerationServiceInterface } from '../../domain/service/production-moderation.service.interface';
import { ProductionAccessService } from './production.access.service';

const DUPLICATE_KEY = 11000;
const MAX_PAGE_SIZE = 50;

/**
 * Sistema de denuncias de Mis Producciones (DEN-01..03): los usuarios
 * denuncian, el contenido se oculta solo al superar el umbral y un admin
 * confirma el bloqueo o lo restaura.
 */
@Injectable()
export class ProductionModerationService
  implements ProductionModerationServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('ProductionItemRepositoryInterface')
    private readonly itemRepository: ProductionItemRepositoryInterface,
    @Inject('ProductionReportRepositoryInterface')
    private readonly reportRepository: ProductionReportRepositoryInterface,
    private readonly accessService: ProductionAccessService,
  ) {}

  /** DEN-01 y DEN-02. */
  async reportProductionContent(
    input: ProductionReportInput,
    userId: string,
  ): Promise<ProductionReportResponse> {
    const production = await this.productionRepository.findById(
      input.productionId,
    );
    if (!production) throw new NotFoundException('Producción no encontrada');

    const viewer = await this.accessService.buildViewerContext(
      production,
      userId,
    );
    if (!this.accessService.evaluateProduction(production, viewer).listed) {
      throw new NotFoundException('Producción no encontrada');
    }
    if (viewer.role !== ProductionRole.visitor) {
      throw new BadRequestException(
        'No podés denunciar un blog del que sos parte',
      );
    }

    const itemId = input.itemId ?? null;
    let currentStatus = production.getModerationStatus;
    if (itemId) {
      const target = await this.accessService.evaluateItemById(
        production,
        itemId,
        viewer,
      );
      if (!target?.decision.listed) {
        throw new NotFoundException('Elemento no encontrado');
      }
      currentStatus = target.item.getModerationStatus;
    }
    if (currentStatus === ProductionModerationStatus.blocked) {
      throw new BadRequestException('Este contenido ya fue bloqueado');
    }

    let reportId: string;
    try {
      reportId = await this.reportRepository.create({
        production: production.getId!,
        item: itemId,
        reporter: userId,
        reason: input.reason,
        details: input.details?.trim() || null,
      });
    } catch (error: any) {
      if (error?.code === DUPLICATE_KEY) {
        throw new BadRequestException('Ya denunciaste este contenido');
      }
      throw error;
    }

    // DEN-02: al llegar al umbral, el contenido se oculta hasta la revisión.
    let contentHidden = false;
    const pending = await this.reportRepository.countPending(
      production.getId!,
      itemId,
    );
    if (
      pending >= getReportsHideThreshold() &&
      currentStatus === ProductionModerationStatus.active
    ) {
      if (itemId) {
        await this.itemRepository.setModerationStatus(
          itemId,
          ProductionModerationStatus.hidden,
        );
      } else {
        await this.productionRepository.setModerationStatus(
          production.getId!,
          ProductionModerationStatus.hidden,
        );
      }
      contentHidden = true;
      this.logger.warn(
        `Contenido oculto por denuncias: producción ${production.getId}, ítem ${itemId ?? '-'} (${pending} denuncias)`,
      );
    }

    return {
      _id: reportId,
      production: production.getId!,
      item: itemId,
      reason: input.reason,
      status: ProductionReportStatus.pending,
      contentHidden,
      createdAt: new Date(),
    };
  }

  async getProductionReportTargetsAdmin(
    status: ProductionReportStatus,
    page: number,
    limit: number,
  ): Promise<ProductionReportTargetListResponse> {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 20));
    const { targets, total } = await this.reportRepository.listTargets(
      status,
      safePage,
      safeLimit,
    );

    const [productions, items] = await Promise.all([
      this.productionRepository.findByIds(targets.map((t) => t.production)),
      this.itemRepository.findManyByIds(
        targets.map((t) => t.item).filter((id): id is string => !!id),
      ),
    ]);
    const productionById = new Map(productions.map((p) => [p.getId!, p]));
    const itemById = new Map(items.map((i) => [i.getId!, i]));
    const owners = await this.productionRepository.findOwnersInfo(
      productions.map((p) => ({ ownerId: p.getOwner, ownerType: p.getOwnerType })),
    );

    return {
      targets: targets.map((target) => {
        const production = productionById.get(target.production);
        const item = target.item ? itemById.get(target.item) : null;
        return {
          production: target.production,
          productionTitle: production?.getTitle ?? null,
          ownerInfo: production ? owners.get(production.getOwner) ?? null : null,
          item: target.item,
          itemName: item?.getName ?? null,
          itemKind: item?.getKind ?? null,
          moderationStatus: target.item
            ? item?.getModerationStatus ?? null
            : production?.getModerationStatus ?? null,
          reports: target.reports,
          reasons: target.reasons,
          lastReportAt: target.lastReportAt,
        };
      }),
      total,
      hasMore: safePage * safeLimit < total,
    };
  }

  async getProductionTargetReportsAdmin(
    productionId: string,
    itemId: string | undefined,
  ): Promise<ProductionReportDetailResponse[]> {
    const reports = await this.reportRepository.listByTarget(
      productionId,
      itemId ?? null,
    );
    const reporters = await this.productionRepository.findUsersInfo(
      reports.map((report) => report.reporter),
    );
    return reports.map((report) => {
      const info = reporters.get(report.reporter);
      return {
        ...report,
        reporterInfo: info
          ? {
              _id: info._id,
              name: info.name,
              lastName: info.lastName,
              username: info.username,
              email: info.email ?? null,
            }
          : null,
      };
    });
  }

  /** DEN-03: el admin confirma el bloqueo o restaura el contenido. */
  async moderateProductionContent(
    input: ProductionModerationInput,
    adminId: string,
  ): Promise<ProductionModerationResultResponse> {
    const production = await this.productionRepository.findById(
      input.productionId,
    );
    if (!production) throw new NotFoundException('Producción no encontrada');
    const itemId = input.itemId ?? null;
    if (itemId) {
      const item = await this.itemRepository.findById(itemId);
      if (!item || item.getProduction !== production.getId) {
        throw new NotFoundException('Elemento no encontrado');
      }
    }

    const block = input.action === ProductionModerationAction.block;
    const moderationStatus = block
      ? ProductionModerationStatus.blocked
      : ProductionModerationStatus.active;
    const reportStatus = block
      ? ProductionReportStatus.upheld
      : ProductionReportStatus.dismissed;

    const session = await this.connection.startSession();
    let resolvedReports = 0;
    try {
      await session.withTransaction(async () => {
        if (itemId) {
          await this.itemRepository.setModerationStatus(
            itemId,
            moderationStatus,
            session,
          );
        } else {
          await this.productionRepository.setModerationStatus(
            production.getId!,
            moderationStatus,
            session,
          );
        }
        resolvedReports = await this.reportRepository.resolvePending(
          production.getId!,
          itemId,
          reportStatus,
          adminId,
          input.note?.trim() || null,
          session,
        );
      });
    } finally {
      await session.endSession();
    }

    this.logger.log(
      `Moderación ${input.action} por ${adminId}: producción ${production.getId}, ítem ${itemId ?? '-'}`,
    );
    return {
      production: production.getId!,
      item: itemId,
      moderationStatus,
      resolvedReports,
    };
  }
}
