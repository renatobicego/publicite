import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ClerkAuthGuardOptional } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard.optional';
import { ProductionAdapterInterface } from '../../../application/adapter/production.adapter.interface';
import {
  ProductionItemKind,
  ProductionOwnerType,
} from '../../../domain/entity/enum/production.enums';
import {
  ProductionCreateRequest,
  ProductionUpdateRequest,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/production.request';
import {
  ProductionArticleRequest,
  ProductionArticleUpdateRequest,
  ProductionFileRequest,
  ProductionFileUpdateRequest,
  ProductionFolderRequest,
  ProductionFolderUpdateRequest,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-item.request';
import {
  ProductionIdResponse,
  ProductionItemResponse,
  ProductionItemsResponse,
  ProductionLimitsResponse,
  ProductionListResponse,
  ProductionResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import {
  optionalUserId,
  ProductionGqlContext,
  requireUserId,
} from './production.context';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

/**
 * Mis Producciones: blog, carpetas, archivos y artículos (Fase 1).
 *
 * Las mutations usan ClerkAuthGuard y la autorización se resuelve en el
 * service contra el dueño guardado (PubliciteAuth + roles del grupo). Las
 * lecturas usan el guard opcional: sin token sólo se ve lo público.
 */
@Resolver()
export class ProductionResolver {
  constructor(
    @Inject('ProductionAdapterInterface')
    private readonly productionAdapter: ProductionAdapterInterface,
  ) {}

  // --- Blog ------------------------------------------------------------------

  @Mutation(() => ProductionIdResponse, {
    description: 'Crear un blog de Mis Producciones (personal o de grupo)',
  })
  @UseGuards(ClerkAuthGuard)
  async createProduction(
    @Args('productionRequest', { type: () => ProductionCreateRequest })
    productionRequest: ProductionCreateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionIdResponse> {
    return this.productionAdapter.createProduction(
      productionRequest,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionResponse, {
    description: 'Editar header, estantería y muestrario del blog',
  })
  @UseGuards(ClerkAuthGuard)
  async updateProductionById(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('productionUpdate', { type: () => ProductionUpdateRequest })
    productionUpdate: ProductionUpdateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.updateProduction(
      productionId,
      productionUpdate,
      requireUserId(context),
    );
  }

  @Mutation(() => String, {
    description: 'Borrar el blog con todo su contenido (hard delete)',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteProductionById(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.productionAdapter.deleteProduction(
      productionId,
      requireUserId(context),
    );
    return 'Producción eliminada con éxito';
  }

  @Query(() => ProductionResponse, {
    description: 'Blog por id. accessKey: clave del blog si está protegido',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async findProductionById(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('accessKey', { type: () => String, nullable: true })
    accessKey: string | undefined,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.findProductionById(
      productionId,
      optionalUserId(context),
      accessKey,
    );
  }

  @Query(() => ProductionResponse, {
    description: 'Blog por su URL autogenerada (BLG-02)',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async findProductionByUrl(
    @Args('url', { type: () => String }) url: string,
    @Args('accessKey', { type: () => String, nullable: true })
    accessKey: string | undefined,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.findProductionByUrl(
      url,
      optionalUserId(context),
      accessKey,
    );
  }

  @Query(() => [ProductionResponse], {
    description:
      'Blogs de un usuario o grupo, para el cartel (NAV-04). Incluye los protegidos por clave',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async findAllProductionsByOwner(
    @Args('ownerId', { type: () => ID }) ownerId: string,
    @Args('ownerType', { type: () => ProductionOwnerType, nullable: true })
    ownerType: ProductionOwnerType | undefined,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse[]> {
    return this.productionAdapter.findProductionsByOwner(
      ownerId,
      ownerType,
      optionalUserId(context),
    );
  }

  @Query(() => ProductionListResponse, {
    description:
      'Listado público de producciones (NAV-02) y buscador (NAV-05). Sin token sólo lo público',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async findAllProductions(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('searchTerm', { type: () => String, nullable: true })
    searchTerm: string | undefined,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionListResponse> {
    return this.productionAdapter.findAllProductions(
      page,
      limit,
      optionalUserId(context),
      searchTerm,
    );
  }

  @Query(() => [ProductionResponse], {
    description:
      'Producciones destacadas para el home (NAV-03). Vacío = no mostrar la sección',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async findFeaturedProductions(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse[]> {
    return this.productionAdapter.findFeaturedProductions(
      limit,
      optionalUserId(context),
    );
  }

  @Query(() => ProductionLimitsResponse, {
    description: 'Blogs y archivos usados vs. límites del plan (RNF-06)',
  })
  @UseGuards(ClerkAuthGuard)
  async getProductionLimits(
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionLimitsResponse> {
    return this.productionAdapter.getProductionLimits(requireUserId(context));
  }

  // --- Alcance y clave (Fase 3) ----------------------------------------------

  @Mutation(() => ProductionResponse, {
    description: 'Alcance por defecto del blog (VIS-01)',
  })
  @UseGuards(ClerkAuthGuard)
  async setProductionVisibility(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('visibility', { type: () => Visibility }) visibility: Visibility,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.setProductionVisibility(
      productionId,
      visibility,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionItemResponse, {
    description:
      'Alcance propio de una carpeta o archivo (VIS-04). Sin visibility vuelve a heredar del padre (VIS-03)',
  })
  @UseGuards(ClerkAuthGuard)
  async setProductionItemVisibility(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('visibility', { type: () => Visibility, nullable: true })
    visibility: Visibility | null,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.setProductionItemVisibility(
      itemId,
      visibility ?? null,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionResponse, {
    description:
      'Configura la clave del blog tipo Zoom (INV-01); sin accessKey la quita. Reemplaza al alcance',
  })
  @UseGuards(ClerkAuthGuard)
  async setProductionAccessKey(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('accessKey', { type: () => String, nullable: true })
    accessKey: string | null,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.setProductionAccessKey(
      productionId,
      accessKey ?? null,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionResponse, {
    description:
      'El visitante ingresa la clave del blog; queda habilitado hasta que la clave cambie',
  })
  @UseGuards(ClerkAuthGuard)
  async unlockProductionWithKey(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('accessKey', { type: () => String }) accessKey: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.productionAdapter.unlockProductionWithKey(
      productionId,
      accessKey,
      requireUserId(context),
    );
  }

  // --- Árbol -----------------------------------------------------------------

  @Query(() => ProductionItemsResponse, {
    description:
      'Grilla de un nivel del blog: carpetas, archivos y artículos (PC-06)',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async getProductionItems(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('parentId', {
      type: () => ID,
      nullable: true,
      description: 'Carpeta a listar; vacío = raíz',
    })
    parentId: string | undefined,
    @Args('accessKey', { type: () => String, nullable: true })
    accessKey: string | undefined,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemsResponse> {
    return this.productionAdapter.getProductionItems(
      productionId,
      parentId,
      optionalUserId(context),
      accessKey,
    );
  }

  @Query(() => ProductionItemResponse, {
    description: 'Detalle de un archivo, artículo o carpeta',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async getProductionItemById(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('accessKey', { type: () => String, nullable: true })
    accessKey: string | undefined,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.getProductionItemById(
      itemId,
      optionalUserId(context),
      accessKey,
    );
  }

  @Mutation(() => ProductionItemResponse, { description: 'Crear una carpeta' })
  @UseGuards(ClerkAuthGuard)
  async createFolder(
    @Args('folderRequest', { type: () => ProductionFolderRequest })
    folderRequest: ProductionFolderRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.createFolder(
      folderRequest,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionItemResponse, {
    description: 'Renombrar una carpeta',
  })
  @UseGuards(ClerkAuthGuard)
  async updateFolder(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('folderUpdate', { type: () => ProductionFolderUpdateRequest })
    folderUpdate: ProductionFolderUpdateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.updateFolder(
      itemId,
      folderUpdate,
      requireUserId(context),
    );
  }

  @Mutation(() => String, {
    description: 'Borrar una carpeta con todo su contenido',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteFolder(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.productionAdapter.deleteItem(
      itemId,
      ProductionItemKind.folder,
      requireUserId(context),
    );
    return 'Carpeta eliminada con éxito';
  }

  @Mutation(() => ProductionItemResponse, {
    description:
      'Registrar un archivo ya subido a UploadThing. Valida el cupo del plan antes de guardar',
  })
  @UseGuards(ClerkAuthGuard)
  async uploadFile(
    @Args('fileRequest', { type: () => ProductionFileRequest })
    fileRequest: ProductionFileRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.uploadFile(fileRequest, requireUserId(context));
  }

  @Mutation(() => ProductionItemResponse, {
    description: 'Editar el ID, el título o el dorso de un archivo',
  })
  @UseGuards(ClerkAuthGuard)
  async updateFile(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('fileUpdate', { type: () => ProductionFileUpdateRequest })
    fileUpdate: ProductionFileUpdateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.updateFile(
      itemId,
      fileUpdate,
      requireUserId(context),
    );
  }

  @Mutation(() => String, {
    description: 'Borrar un archivo (libera cupo del plan)',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteFile(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.productionAdapter.deleteItem(
      itemId,
      ProductionItemKind.file,
      requireUserId(context),
    );
    return 'Archivo eliminado con éxito';
  }

  @Mutation(() => ProductionItemResponse, {
    description: 'Crear un artículo con bloques de Editor.js',
  })
  @UseGuards(ClerkAuthGuard)
  async createArticle(
    @Args('articleRequest', { type: () => ProductionArticleRequest })
    articleRequest: ProductionArticleRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.createArticle(
      articleRequest,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionItemResponse, { description: 'Editar un artículo' })
  @UseGuards(ClerkAuthGuard)
  async updateArticle(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('articleUpdate', { type: () => ProductionArticleUpdateRequest })
    articleUpdate: ProductionArticleUpdateRequest,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionItemResponse> {
    return this.productionAdapter.updateArticle(
      itemId,
      articleUpdate,
      requireUserId(context),
    );
  }

  @Mutation(() => String, {
    description: 'Borrar un artículo (libera cupo del plan)',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteArticle(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.productionAdapter.deleteItem(
      itemId,
      ProductionItemKind.article,
      requireUserId(context),
    );
    return 'Artículo eliminado con éxito';
  }
}
