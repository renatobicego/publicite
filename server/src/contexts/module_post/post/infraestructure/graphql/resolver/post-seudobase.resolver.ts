import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { PostSeudoBaseAdapterInterface } from '../../../application/adapter/post-seudobase.adapter.interface';
import {
  PostBulkDeleteInput,
  PostBulkPriceInput,
  PostBulkVisibilityInput,
  PostSeudoBaseFilters,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/post-seudobase.request';
import {
  PostAuditLogResponse,
  PostBulkResultResponse,
  PostSeudoBaseResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/post-seudobase.response';

/**
 * SeudoBase de Anuncios: vista tipo Excel y operaciones masivas del usuario
 * sobre SUS propios anuncios. El usuario se deriva del token (nunca del
 * cliente); toda operación masiva exige `confirm: true` y queda auditada.
 */
@Resolver()
@UseGuards(ClerkAuthGuard)
export class PostSeudoBaseResolver {
  constructor(
    @Inject('PostSeudoBaseAdapterInterface')
    private readonly seudoBaseAdapter: PostSeudoBaseAdapterInterface,
  ) {}

  @Query(() => PostSeudoBaseResponse, {
    description:
      'Tabla de gestión de los anuncios del usuario con filtros y búsqueda (SB-01)',
  })
  async getPostSeudoBase(
    @Args('filters', { type: () => PostSeudoBaseFilters, nullable: true })
    filters: PostSeudoBaseFilters | undefined,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<PostSeudoBaseResponse> {
    return this.seudoBaseAdapter.getPostSeudoBase(
      context.req.userRequestId,
      filters,
      page,
      limit,
    );
  }

  @Mutation(() => PostBulkResultResponse, {
    description: 'Edición masiva del precio de los anuncios propios (SB-02)',
  })
  async bulkUpdatePostPrices(
    @Args('input', { type: () => PostBulkPriceInput })
    input: PostBulkPriceInput,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<PostBulkResultResponse> {
    return this.seudoBaseAdapter.bulkUpdatePostPrices(
      input,
      context.req.userRequestId,
    );
  }

  @Mutation(() => PostBulkResultResponse, {
    description: 'Cambio masivo de visibilidad de los anuncios propios (SB-02)',
  })
  async bulkUpdatePostVisibility(
    @Args('input', { type: () => PostBulkVisibilityInput })
    input: PostBulkVisibilityInput,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<PostBulkResultResponse> {
    return this.seudoBaseAdapter.bulkUpdatePostVisibility(
      input,
      context.req.userRequestId,
    );
  }

  @Mutation(() => PostBulkResultResponse, {
    description: 'Borrado masivo de anuncios propios (hard delete) (SB-02/03)',
  })
  async bulkDeletePosts(
    @Args('input', { type: () => PostBulkDeleteInput })
    input: PostBulkDeleteInput,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<PostBulkResultResponse> {
    return this.seudoBaseAdapter.bulkDeletePosts(
      input,
      context.req.userRequestId,
    );
  }

  @Query(() => PostAuditLogResponse, {
    description: 'Auditoría de las operaciones masivas de anuncios (SB-03)',
  })
  async getPostAuditLog(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<PostAuditLogResponse> {
    return this.seudoBaseAdapter.getPostAuditLog(
      context.req.userRequestId,
      page,
      limit,
    );
  }
}
