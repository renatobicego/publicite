import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { Production } from '../../domain/entity/production.entity';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionItemRepositoryInterface } from '../../domain/repository/production-item.repository.interface';
import { ProductionAccessGrantRepositoryInterface } from '../../domain/repository/production-access-grant.repository.interface';

export interface DeletedItemsResult {
  deletedIds: string[];
  freedQuota: number;
}

/**
 * Hard delete en cascada de MP (RNF-05, BLG-06): mismo criterio que Anuncios,
 * sin soft delete. Siempre corre dentro de la transacción de quien lo llama.
 */
@Injectable()
export class ProductionCascadeService {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('ProductionItemRepositoryInterface')
    private readonly itemRepository: ProductionItemRepositoryInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('ProductionAccessGrantRepositoryInterface')
    private readonly grantRepository: ProductionAccessGrantRepositoryInterface,
  ) {}

  async deleteProduction(
    production: Production,
    session: ClientSession,
  ): Promise<void> {
    const productionId = production.getId!;

    const deletedItems = await this.itemRepository.deleteByProduction(
      productionId,
      session,
    );
    this.logger.log(
      `Deleting production ${productionId}: ${deletedItems} items removed`,
    );
    await this.grantRepository.deleteByProduction(productionId, session);

    // Libera el cupo de blogs del creator (User.productions[]).
    await this.userService.removeProductionFromUser(
      productionId,
      production.getCreator,
      { session },
    );
    if (production.isGroupBlog) {
      await this.productionRepository.setGroupBlog(
        production.getOwner,
        null,
        session,
      );
    }
    await this.productionRepository.deleteById(productionId, session);
  }

  /**
   * Borra ítems con todo su subárbol (una carpeta arrastra su contenido) y
   * libera el cupo de archivos del blog (BLG-06, SB-03).
   */
  async deleteItems(
    production: Production,
    itemIds: string[],
    session: ClientSession,
  ): Promise<DeletedItemsResult> {
    const ids = new Set<string>();
    const quotaIds = new Set<string>();

    for (const itemId of itemIds) {
      const subtree = await this.itemRepository.findSubtree(itemId, session);
      subtree.ids.forEach((id) => ids.add(id));
      subtree.quotaIds.forEach((id) => quotaIds.add(id));
    }

    const deletedIds = Array.from(ids);
    if (deletedIds.length === 0) return { deletedIds, freedQuota: 0 };

    await this.itemRepository.deleteByIds(deletedIds, session);
    await this.productionRepository.decrementFilesCount(
      production.getId!,
      quotaIds.size,
      session,
    );
    await this.productionRepository.removeFromShowcase(
      production.getId!,
      deletedIds,
      session,
    );

    return { deletedIds, freedQuota: quotaIds.size };
  }
}
