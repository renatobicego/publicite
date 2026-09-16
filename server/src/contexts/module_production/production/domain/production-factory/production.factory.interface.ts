import { Production } from '../entity/production.entity';
import {
  ProductionArticle,
  ProductionFile,
  ProductionFolder,
} from '../entity/production-item.entity';
import { ProductionOwnerType } from '../entity/enum/production.enums';
import { ProductionCreateRequest } from '../entity/models_graphql/HTTP-REQUEST/production.request';
import {
  ProductionArticleRequest,
  ProductionFileRequest,
  ProductionFolderRequest,
} from '../entity/models_graphql/HTTP-REQUEST/production-item.request';

export interface ProductionFactoryInterface {
  createProduction(
    request: ProductionCreateRequest,
    owner: { ownerId: string; ownerType: ProductionOwnerType; creatorId: string },
  ): Production;
  createFolder(request: ProductionFolderRequest, userId: string): ProductionFolder;
  createFile(
    request: ProductionFileRequest,
    fileName: string,
    userId: string,
  ): ProductionFile;
  createArticle(
    request: ProductionArticleRequest,
    fileName: string,
    userId: string,
  ): ProductionArticle;
}
