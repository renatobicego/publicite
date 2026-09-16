import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import {
  group_creator_changed,
  group_deleted,
} from 'src/contexts/module_shared/event-emmiter/events';

import { ProductionAdapterInterface } from '../../application/adapter/production.adapter.interface';
import { ProductionServiceInterface } from '../../domain/service/production.service.interface';
import { ProductionInsightsServiceInterface } from '../../domain/service/production-insights.service.interface';
import {
  ProductionCreateRequest,
  ProductionUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production.request';
import {
  ProductionArticleRequest,
  ProductionArticleUpdateRequest,
  ProductionFileRequest,
  ProductionFileUpdateRequest,
  ProductionFolderRequest,
  ProductionFolderUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-item.request';
import {
  ProductionItemKind,
  ProductionOwnerType,
} from '../../domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

@Injectable()
export class ProductionAdapter implements ProductionAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('ProductionServiceInterface')
    private readonly productionService: ProductionServiceInterface,
    @Inject('ProductionInsightsServiceInterface')
    private readonly insightsService: ProductionInsightsServiceInterface,
  ) {}

  // --- Eventos del módulo de grupos (GRP-01, RNF-05) ----------------------------
  // Corren después de que el grupo ya cambió: un error acá se registra pero no
  // debe hacer fallar la operación del grupo.

  @OnEvent(group_deleted)
  async onGroupDeleted(payload: { groupId: string }): Promise<void> {
    try {
      await this.productionService.deleteGroupBlog(payload.groupId);
    } catch (error: any) {
      this.logger.error(
        `No se pudo borrar el blog del grupo ${payload?.groupId}: ${error?.message}`,
      );
    }
  }

  @OnEvent(group_creator_changed)
  async onGroupCreatorChanged(payload: {
    groupId: string;
    previousCreator: string;
    newCreator: string;
  }): Promise<void> {
    try {
      await this.productionService.transferGroupBlog(
        payload.groupId,
        payload.previousCreator,
        payload.newCreator,
      );
    } catch (error: any) {
      this.logger.error(
        `No se pudo transferir el blog del grupo ${payload?.groupId}: ${error?.message}`,
      );
    }
  }

  deleteGroupBlog(groupId: string) {
    return this.productionService.deleteGroupBlog(groupId);
  }

  transferGroupBlog(groupId: string, previousCreator: string, newCreator: string) {
    return this.productionService.transferGroupBlog(
      groupId,
      previousCreator,
      newCreator,
    );
  }

  getProductionConsumption(userId: string, productionId?: string) {
    return this.insightsService.getProductionConsumption(userId, productionId);
  }

  createProduction(request: ProductionCreateRequest, userId: string) {
    return this.productionService.createProduction(request, userId);
  }

  updateProduction(
    productionId: string,
    request: ProductionUpdateRequest,
    userId: string,
  ) {
    return this.productionService.updateProduction(
      productionId,
      request,
      userId,
    );
  }

  deleteProduction(productionId: string, userId: string) {
    return this.productionService.deleteProduction(productionId, userId);
  }

  createFolder(request: ProductionFolderRequest, userId: string) {
    return this.productionService.createFolder(request, userId);
  }

  updateFolder(
    itemId: string,
    request: ProductionFolderUpdateRequest,
    userId: string,
  ) {
    return this.productionService.updateFolder(itemId, request, userId);
  }

  uploadFile(request: ProductionFileRequest, userId: string) {
    return this.productionService.uploadFile(request, userId);
  }

  updateFile(
    itemId: string,
    request: ProductionFileUpdateRequest,
    userId: string,
  ) {
    return this.productionService.updateFile(itemId, request, userId);
  }

  createArticle(request: ProductionArticleRequest, userId: string) {
    return this.productionService.createArticle(request, userId);
  }

  updateArticle(
    itemId: string,
    request: ProductionArticleUpdateRequest,
    userId: string,
  ) {
    return this.productionService.updateArticle(itemId, request, userId);
  }

  deleteItem(itemId: string, kind: ProductionItemKind, userId: string) {
    return this.productionService.deleteItem(itemId, kind, userId);
  }

  findProductionById(productionId: string, userId?: string, accessKey?: string) {
    return this.productionService.findProductionById(
      productionId,
      userId,
      accessKey,
    );
  }

  findProductionByUrl(url: string, userId?: string, accessKey?: string) {
    return this.productionService.findProductionByUrl(url, userId, accessKey);
  }

  findProductionsByOwner(
    ownerId: string,
    ownerType: ProductionOwnerType | undefined,
    userId?: string,
  ) {
    return this.productionService.findProductionsByOwner(
      ownerId,
      ownerType,
      userId,
    );
  }

  getProductionItems(
    productionId: string,
    parentId: string | undefined,
    userId?: string,
    accessKey?: string,
  ) {
    return this.productionService.getProductionItems(
      productionId,
      parentId,
      userId,
      accessKey,
    );
  }

  getProductionItemById(itemId: string, userId?: string, accessKey?: string) {
    return this.productionService.getProductionItemById(
      itemId,
      userId,
      accessKey,
    );
  }

  getProductionLimits(userId: string) {
    return this.productionService.getProductionLimits(userId);
  }

  findAllProductions(
    page: number,
    limit: number,
    userId?: string,
    searchTerm?: string,
  ) {
    return this.productionService.findAllProductions(
      page,
      limit,
      userId,
      searchTerm,
    );
  }

  findFeaturedProductions(limit: number, userId?: string) {
    return this.productionService.findFeaturedProductions(limit, userId);
  }

  setProductionFeatured(productionId: string, isFeatured: boolean) {
    return this.productionService.setProductionFeatured(
      productionId,
      isFeatured,
    );
  }

  setProductionVisibility(
    productionId: string,
    visibility: Visibility,
    userId: string,
  ) {
    return this.productionService.setProductionVisibility(
      productionId,
      visibility,
      userId,
    );
  }

  setProductionItemVisibility(
    itemId: string,
    visibility: Visibility | null,
    userId: string,
  ) {
    return this.productionService.setProductionItemVisibility(
      itemId,
      visibility,
      userId,
    );
  }

  setProductionAccessKey(
    productionId: string,
    accessKey: string | null,
    userId: string,
  ) {
    return this.productionService.setProductionAccessKey(
      productionId,
      accessKey,
      userId,
    );
  }

  unlockProductionWithKey(
    productionId: string,
    accessKey: string,
    userId: string | undefined,
  ) {
    return this.productionService.unlockProductionWithKey(
      productionId,
      accessKey,
      userId,
    );
  }
}
