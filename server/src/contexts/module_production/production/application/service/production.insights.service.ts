import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { ChatbotTokenServiceInterface } from 'src/contexts/module_user/chatbot/domain/service/chatbot.token.service.interface';
import { Production } from '../../domain/entity/production.entity';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionInsightsServiceInterface } from '../../domain/service/production-insights.service.interface';
import {
  ProductionBlogConsumptionResponse,
  ProductionConsumptionResponse,
  ProductionTokenConsumptionResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production-consumption.response';
import { ProductionAccessService } from './production.access.service';

@Injectable()
export class ProductionInsightsService
  implements ProductionInsightsServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('ChatbotTokenServiceInterface')
    private readonly tokenService: ChatbotTokenServiceInterface,
    private readonly accessService: ProductionAccessService,
  ) {}

  async getProductionConsumption(
    userId: string,
    productionId?: string,
  ): Promise<ProductionConsumptionResponse> {
    const [tokens, limits] = await Promise.all([
      this.getTokens(userId),
      this.userService.getProductionLimitsFromUserByUserId(userId),
    ]);

    let productions: Production[];
    if (productionId) {
      const production = await this.productionRepository.findById(productionId);
      if (!production) throw new NotFoundException('Producción no encontrada');
      await this.accessService.assertPermission(
        production,
        userId,
        'canViewInsights',
      );
      productions = [production];
    } else {
      productions = await this.productionRepository.findByCreator(userId);
    }

    const blogs: ProductionBlogConsumptionResponse[] = [];
    for (const production of productions) {
      // El límite de archivos es el del plan del creator del blog (GRP-08).
      const filesPerBlogLimit =
        production.getCreator === userId
          ? limits.filesPerBlogLimit
          : (await this.accessService.getCreatorLimits(production))
              .filesPerBlogLimit;
      const filesCount = production.getFilesCount ?? 0;
      blogs.push({
        productionId: production.getId!,
        title: production.getTitle,
        ownerType: production.getOwnerType,
        role: await this.accessService.resolveRole(production, userId),
        filesCount,
        filesPerBlogLimit,
        filesAvailable: Math.max(0, filesPerBlogLimit - filesCount),
      });
    }

    return { tokens, limits, blogs };
  }

  /** Saldo de tokens de IA. Si el token bucket falla, el panel igual responde. */
  private async getTokens(
    userId: string,
  ): Promise<ProductionTokenConsumptionResponse | null> {
    try {
      const status = await this.tokenService.getStatusForUser(userId);
      return {
        source: status.source,
        allowance: status.allowance,
        used: status.used,
        remaining: status.remaining,
        resetsAt: status.resetsAt ?? null,
      };
    } catch (error: any) {
      this.logger.error(
        `No se pudo obtener el consumo de tokens del usuario ${userId}: ${error?.message}`,
      );
      return null;
    }
  }
}
