import {
  ProductionIdResponse,
  ProductionItemResponse,
  ProductionItemsResponse,
  ProductionLimitsResponse,
  ProductionListResponse,
  ProductionResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production.response';
import {
  ProductionCreateRequest,
  ProductionUpdateRequest,
} from '../entity/models_graphql/HTTP-REQUEST/production.request';
import {
  ProductionArticleRequest,
  ProductionArticleUpdateRequest,
  ProductionFileRequest,
  ProductionFileUpdateRequest,
  ProductionFolderRequest,
  ProductionFolderUpdateRequest,
} from '../entity/models_graphql/HTTP-REQUEST/production-item.request';
import {
  ProductionItemKind,
  ProductionOwnerType,
} from '../entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

export interface ProductionServiceInterface {
  createProduction(
    request: ProductionCreateRequest,
    userId: string,
  ): Promise<ProductionIdResponse>;
  updateProduction(
    productionId: string,
    request: ProductionUpdateRequest,
    userId: string,
  ): Promise<ProductionResponse>;
  deleteProduction(productionId: string, userId: string): Promise<void>;

  createFolder(
    request: ProductionFolderRequest,
    userId: string,
  ): Promise<ProductionItemResponse>;
  updateFolder(
    itemId: string,
    request: ProductionFolderUpdateRequest,
    userId: string,
  ): Promise<ProductionItemResponse>;
  uploadFile(
    request: ProductionFileRequest,
    userId: string,
  ): Promise<ProductionItemResponse>;
  updateFile(
    itemId: string,
    request: ProductionFileUpdateRequest,
    userId: string,
  ): Promise<ProductionItemResponse>;
  createArticle(
    request: ProductionArticleRequest,
    userId: string,
  ): Promise<ProductionItemResponse>;
  updateArticle(
    itemId: string,
    request: ProductionArticleUpdateRequest,
    userId: string,
  ): Promise<ProductionItemResponse>;
  deleteItem(
    itemId: string,
    kind: ProductionItemKind,
    userId: string,
  ): Promise<void>;

  findProductionById(
    productionId: string,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionResponse>;
  findProductionByUrl(
    url: string,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionResponse>;
  findProductionsByOwner(
    ownerId: string,
    ownerType: ProductionOwnerType | undefined,
    userId?: string,
  ): Promise<ProductionResponse[]>;
  getProductionItems(
    productionId: string,
    parentId: string | undefined,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionItemsResponse>;
  getProductionItemById(
    itemId: string,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionItemResponse>;
  getProductionLimits(userId: string): Promise<ProductionLimitsResponse>;

  findAllProductions(
    page: number,
    limit: number,
    userId?: string,
    searchTerm?: string,
  ): Promise<ProductionListResponse>;
  findFeaturedProductions(
    limit: number,
    userId?: string,
  ): Promise<ProductionResponse[]>;
  setProductionFeatured(
    productionId: string,
    isFeatured: boolean,
  ): Promise<ProductionResponse>;

  setProductionVisibility(
    productionId: string,
    visibility: Visibility,
    userId: string,
  ): Promise<ProductionResponse>;
  setProductionItemVisibility(
    itemId: string,
    visibility: Visibility | null,
    userId: string,
  ): Promise<ProductionItemResponse>;
  setProductionAccessKey(
    productionId: string,
    accessKey: string | null,
    userId: string,
  ): Promise<ProductionResponse>;
  unlockProductionWithKey(
    productionId: string,
    accessKey: string,
    userId: string | undefined,
  ): Promise<ProductionResponse>;
}
