import { sanitizeArticleBlocks } from '../functions/production.article-sanitize';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionArticle,
  ProductionFile,
  ProductionFolder,
} from '../../domain/entity/production-item.entity';
import {
  ProductionBehaviourType,
  ProductionOwnerType,
} from '../../domain/entity/enum/production.enums';
import { ProductionCreateRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/production.request';
import {
  ProductionArticleRequest,
  ProductionFileRequest,
  ProductionFolderRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-item.request';
import { ProductionFactoryInterface } from '../../domain/production-factory/production.factory.interface';
import { buildProductionUrl } from '../functions/production.url';
import { requireNonEmpty } from '../functions/production.text';
import {
  assertVisibilityMatchesBehaviour,
  defaultVisibilityFor,
  normalizeGeoLocation,
} from '../functions/production.behaviour';

/**
 * Arma las entidades de MP a partir de los requests (patrón PostFactory: un
 * método por subtipo de ítem). No persiste nada.
 */
export class ProductionFactory implements ProductionFactoryInterface {
  private static instance: ProductionFactory | null = null;

  public static getInstance(): ProductionFactory {
    if (!ProductionFactory.instance) {
      ProductionFactory.instance = new ProductionFactory();
    }
    return ProductionFactory.instance;
  }

  createProduction(
    request: ProductionCreateRequest,
    owner: { ownerId: string; ownerType: ProductionOwnerType; creatorId: string },
  ): Production {
    const title = requireNonEmpty(request.title, 'El nombre del blog');

    // Comportamiento libre/agenda: sólo blogs personales, como Anuncios.
    const isPersonal = owner.ownerType === ProductionOwnerType.User;
    const behaviourType = isPersonal
      ? request.behaviourType ?? ProductionBehaviourType.libre
      : null;
    const visibility =
      request.visibility ??
      (behaviourType ? defaultVisibilityFor(behaviourType) : undefined);
    if (behaviourType && visibility) {
      assertVisibilityMatchesBehaviour(behaviourType, visibility);
    }
    const geoLocation =
      behaviourType === ProductionBehaviourType.libre
        ? normalizeGeoLocation(request.geoLocation)
        : null;

    return new Production({
      owner: owner.ownerId,
      ownerType: owner.ownerType,
      creator: owner.creatorId,
      title,
      description: request.description?.trim() ?? '',
      headerPhotoKey: request.headerPhotoKey,
      welcomeText: request.welcomeText,
      welcomeVideoKey: request.welcomeVideoKey,
      url: buildProductionUrl(title),
      shelf: request.shelf ?? [],
      visibility,
      behaviourType,
      geoLocation,
    });
  }

  createFolder(request: ProductionFolderRequest, userId: string): ProductionFolder {
    return new ProductionFolder({
      production: request.productionId,
      parent: request.parentId ?? null,
      name: requireNonEmpty(request.name, 'El nombre de la carpeta'),
      visibility: request.visibility ?? null,
      createdBy: userId,
    });
  }

  createFile(
    request: ProductionFileRequest,
    fileName: string,
    userId: string,
  ): ProductionFile {
    return new ProductionFile({
      production: request.productionId,
      parent: request.parentId ?? null,
      name: request.name?.trim() || fileName,
      visibility: request.visibility ?? null,
      createdBy: userId,
      fileName,
      fileType: request.fileType,
      key: requireNonEmpty(request.key, 'La key del archivo'),
      sizeBytes:
        typeof request.sizeBytes === 'number' && request.sizeBytes > 0
          ? Math.floor(request.sizeBytes)
          : 0,
      postcard: request.postcard ? { ...request.postcard } : undefined,
    });
  }

  createArticle(
    request: ProductionArticleRequest,
    fileName: string,
    userId: string,
  ): ProductionArticle {
    return new ProductionArticle({
      production: request.productionId,
      parent: request.parentId ?? null,
      name: requireNonEmpty(request.title, 'El título del artículo'),
      visibility: request.visibility ?? null,
      createdBy: userId,
      fileName,
      blocks: sanitizeArticleBlocks(request.blocks),
    });
  }
}
