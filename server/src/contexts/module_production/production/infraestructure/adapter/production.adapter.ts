import { Inject, Injectable } from '@nestjs/common';

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
    @Inject('ProductionServiceInterface')
    private readonly productionService: ProductionServiceInterface,
    @Inject('ProductionInsightsServiceInterface')
    private readonly insightsService: ProductionInsightsServiceInterface,
  ) {}

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
