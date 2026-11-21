import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ClerkAuthGuardOptional } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard.optional';
import { ProductionCommunityAdapterInterface } from '../../../application/adapter/production-community.adapter.interface';
import {
  ProductionCommentInput,
  ProductionReviewInput,
  ProductionReviewUpdateInput,
} from '../../../domain/entity/models_graphql/HTTP-REQUEST/production-community.request';
import {
  ProductionCommentListResponse,
  ProductionCommentResponse,
  ProductionFanListResponse,
  ProductionLoveItResultsResponse,
  ProductionPendingReviewResponse,
  ProductionPhotoVoteResponse,
  ProductionReviewListResponse,
  ProductionReviewResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production-community.response';
import {
  ProductionListResponse,
  ProductionResponse,
} from '../../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import {
  optionalUserId,
  ProductionGqlContext,
  requireUserId,
} from './production.context';
import { ProductionPhotoVote } from '../../../domain/entity/enum/production.enums';

/** Fans, reseñas y comentarios de Mis Producciones (Fase 8). */
@Resolver()
export class ProductionCommunityResolver {
  constructor(
    @Inject('ProductionCommunityAdapterInterface')
    private readonly communityAdapter: ProductionCommunityAdapterInterface,
  ) {}

  // --- Fans (FAN-01) ----------------------------------------------------------

  @Mutation(() => ProductionResponse, { description: 'Hacerse fan de un blog' })
  @UseGuards(ClerkAuthGuard)
  async becomeProductionFan(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.communityAdapter.becomeProductionFan(
      productionId,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionResponse, { description: 'Dejar de ser fan' })
  @UseGuards(ClerkAuthGuard)
  async stopBeingProductionFan(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionResponse> {
    return this.communityAdapter.stopBeingProductionFan(
      productionId,
      requireUserId(context),
    );
  }

  @Query(() => ProductionFanListResponse, {
    description: 'Fans del blog para el Panel del propietario (staff)',
  })
  @UseGuards(ClerkAuthGuard)
  async getProductionFans(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionFanListResponse> {
    return this.communityAdapter.getProductionFans(
      productionId,
      requireUserId(context),
      page,
      limit,
    );
  }

  @Query(() => ProductionListResponse, {
    description: 'Blogs de los que el usuario es fan',
  })
  @UseGuards(ClerkAuthGuard)
  async getMyFanProductions(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionListResponse> {
    return this.communityAdapter.getMyFanProductions(
      requireUserId(context),
      page,
      limit,
    );
  }

  // --- Reseñas (REV-01/02) ------------------------------------------------------

  @Mutation(() => ProductionReviewResponse, {
    description:
      'Reseña y calificación de quien accedió con un ticket; libera el bloqueo por reseña pendiente',
  })
  @UseGuards(ClerkAuthGuard)
  async createProductionReview(
    @Args('input', { type: () => ProductionReviewInput })
    input: ProductionReviewInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionReviewResponse> {
    return this.communityAdapter.createProductionReview(
      input,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionReviewResponse, { description: 'Editar mi reseña' })
  @UseGuards(ClerkAuthGuard)
  async updateProductionReview(
    @Args('reviewId', { type: () => ID }) reviewId: string,
    @Args('input', { type: () => ProductionReviewUpdateInput })
    input: ProductionReviewUpdateInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionReviewResponse> {
    return this.communityAdapter.updateProductionReview(
      reviewId,
      input,
      requireUserId(context),
    );
  }

  @Mutation(() => String, { description: 'Borrar mi reseña' })
  @UseGuards(ClerkAuthGuard)
  async deleteProductionReview(
    @Args('reviewId', { type: () => ID }) reviewId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.communityAdapter.deleteProductionReview(
      reviewId,
      requireUserId(context),
    );
    return 'Reseña eliminada con éxito';
  }

  @Query(() => ProductionReviewListResponse, {
    description: 'Reseñas de una producción',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async getProductionReviews(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionReviewListResponse> {
    return this.communityAdapter.getProductionReviews(
      productionId,
      optionalUserId(context),
      page,
      limit,
    );
  }

  @Query(() => ProductionPendingReviewResponse, {
    nullable: true,
    description:
      'Reseña pendiente del usuario (REV-02). Mientras exista, no puede comprar tickets ni visitar otras producciones',
  })
  @UseGuards(ClerkAuthGuard)
  async getMyPendingProductionReview(
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionPendingReviewResponse | null> {
    return this.communityAdapter.getMyPendingProductionReview(
      requireUserId(context),
    );
  }

  // --- Comentarios (REV-01) -------------------------------------------------------

  @Mutation(() => ProductionCommentResponse, {
    description: 'Comentar un blog o un archivo que se puede ver',
  })
  @UseGuards(ClerkAuthGuard)
  async createProductionComment(
    @Args('input', { type: () => ProductionCommentInput })
    input: ProductionCommentInput,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionCommentResponse> {
    return this.communityAdapter.createProductionComment(
      input,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionCommentResponse, {
    description: 'Respuesta del staff del blog a un comentario',
  })
  @UseGuards(ClerkAuthGuard)
  async replyProductionComment(
    @Args('commentId', { type: () => ID }) commentId: string,
    @Args('comment', { type: () => String }) comment: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionCommentResponse> {
    return this.communityAdapter.replyProductionComment(
      commentId,
      comment,
      requireUserId(context),
    );
  }

  @Mutation(() => ProductionCommentResponse, { description: 'Editar mi comentario' })
  @UseGuards(ClerkAuthGuard)
  async updateProductionComment(
    @Args('commentId', { type: () => ID }) commentId: string,
    @Args('comment', { type: () => String }) comment: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionCommentResponse> {
    return this.communityAdapter.updateProductionComment(
      commentId,
      comment,
      requireUserId(context),
    );
  }

  @Mutation(() => String, {
    description: 'Borrar un comentario (su autor o el staff del blog)',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteProductionComment(
    @Args('commentId', { type: () => ID }) commentId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<string> {
    await this.communityAdapter.deleteProductionComment(
      commentId,
      requireUserId(context),
    );
    return 'Comentario eliminado con éxito';
  }

  @Query(() => ProductionCommentListResponse, {
    description: 'Comentarios de un blog o de un archivo',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async getProductionComments(
    @Args('productionId', { type: () => ID }) productionId: string,
    @Args('itemId', { type: () => ID, nullable: true }) itemId: string | undefined,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionCommentListResponse> {
    return this.communityAdapter.getProductionComments(
      productionId,
      itemId,
      optionalUserId(context),
      page,
      limit,
    );
  }

  // --- Love It ------------------------------------------------------------------

  @Mutation(() => ProductionPhotoVoteResponse, {
    description:
      'Love It: votar una foto de un álbum (fan, like, maybe, no). vote vacío = quitar el voto',
  })
  @UseGuards(ClerkAuthGuard)
  async setProductionPhotoVote(
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('vote', { type: () => ProductionPhotoVote, nullable: true })
    vote: ProductionPhotoVote | null,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionPhotoVoteResponse> {
    return this.communityAdapter.setProductionPhotoVote(
      itemId,
      vote ?? null,
      requireUserId(context),
    );
  }

  @Query(() => [ProductionPhotoVoteResponse], {
    description: 'Love It: mis votos en las fotos de un álbum',
  })
  @UseGuards(ClerkAuthGuard)
  async getMyProductionPhotoVotes(
    @Args('folderId', { type: () => ID }) folderId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionPhotoVoteResponse[]> {
    return this.communityAdapter.getMyProductionPhotoVotes(
      folderId,
      requireUserId(context),
    );
  }

  @Query(() => ProductionLoveItResultsResponse, {
    description: 'Love It: resultados del álbum, quién votó qué (staff del blog)',
  })
  @UseGuards(ClerkAuthGuard)
  async getProductionLoveItResults(
    @Args('folderId', { type: () => ID }) folderId: string,
    @Context() context: ProductionGqlContext,
  ): Promise<ProductionLoveItResultsResponse> {
    return this.communityAdapter.getProductionLoveItResults(
      folderId,
      requireUserId(context),
    );
  }
}
