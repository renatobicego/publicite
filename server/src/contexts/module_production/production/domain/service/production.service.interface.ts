import {
  ProductionIdResponse,
  ProductionItemResponse,
  ProductionItemsResponse,
  ProductionLimitsResponse,
  ProductionMapNodeResponse,
  ProductionListResponse,
  ProductionResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production.response';
import {
  ProductionCreateRequest,
  ProductionGeoLocationInput,
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
  ProductionAccessFilter,
  ProductionBehaviourType,
  ProductionItemKind,
  ProductionOwnerType,
  ProductionVisibility,
} from '../entity/enum/production.enums';
import { Visibility_Of_Find } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

/** Solapa y filtros del explorar de Producciones (como Anuncios). */
export interface ProductionExploreOptions {
  /** Sin valor: "Todas". libre: solapa Libres. agenda: Agenda de contactos. */
  behaviourType?: ProductionBehaviourType;
  /** Ubicación del visitante, para el radio de los blogs libres. */
  userLocation?: { latitude: number; longitude: number };
  /** Agenda: tipo de relación a mostrar (hierarchy = todas). */
  relation?: Visibility_Of_Find;
  /** Sub-solapa por el ticket del blog completo (sin valor = todos). */
  access?: ProductionAccessFilter;
}

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
  /** Mueve ítems a otra carpeta del blog (vacío = raíz). Devuelve cuántos movió. */
  moveItems(
    productionId: string,
    itemIds: string[],
    targetParentId: string | undefined | null,
    userId: string,
  ): Promise<number>;

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
  /** Árbol completo del blog para el mapa de tickets y alcances (staff). */
  getProductionMap(
    productionId: string,
    userId: string,
  ): Promise<ProductionMapNodeResponse[]>;
  getProductionLimits(userId: string): Promise<ProductionLimitsResponse>;

  findAllProductions(
    page: number,
    limit: number,
    userId?: string,
    searchTerm?: string,
    options?: ProductionExploreOptions,
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
    visibility: ProductionVisibility,
    userId: string,
  ): Promise<ProductionResponse>;
  updateProductionBehaviour(
    productionId: string,
    behaviourType: ProductionBehaviourType,
    visibility: ProductionVisibility | undefined,
    geoLocation: ProductionGeoLocationInput | undefined,
    userId: string,
  ): Promise<ProductionResponse>;
  setProductionItemVisibility(
    itemId: string,
    visibility: ProductionVisibility | null,
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

  findProductionsByIds(
    productionIds: string[],
    userId?: string,
  ): Promise<ProductionResponse[]>;

  deleteGroupBlog(groupId: string): Promise<void>;
  transferGroupBlog(
    groupId: string,
    previousCreator: string,
    newCreator: string,
  ): Promise<void>;
}
