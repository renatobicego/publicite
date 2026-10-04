import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { Production } from '../../domain/entity/production.entity';
import { ProductionRole } from '../../domain/entity/enum/production.enums';
import {
  ProductionCommentInput,
  ProductionReviewInput,
  ProductionReviewUpdateInput,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-community.request';
import {
  ProductionCommentListResponse,
  ProductionCommentResponse,
  ProductionFanListResponse,
  ProductionPendingReviewResponse,
  ProductionReviewListResponse,
  ProductionReviewResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production-community.response';
import {
  ProductionListResponse,
  ProductionOwnerResponse,
  ProductionResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import {
  ProductionComment,
  ProductionCommunityRepositoryInterface,
  ProductionReview,
} from '../../domain/repository/production-community.repository.interface';
import { ProductionTicketPurchaseRepositoryInterface } from '../../domain/repository/production-ticket.repository.interface';
import { ProductionServiceInterface } from '../../domain/service/production.service.interface';
import { ProductionCommunityServiceInterface } from '../../domain/service/production-community.service.interface';
import { ProductionAccessService } from './production.access.service';
import { ProductionPermissions } from '../functions/production.roles';
import { requireNonEmpty } from '../functions/production.text';

const DUPLICATE_KEY = 11000;
const MAX_PAGE_SIZE = 50;

const paging = (page: number, limit: number) => ({
  page: Math.max(1, Math.floor(page) || 1),
  limit: Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 20)),
});

type UserInfoMap = Map<string, ProductionOwnerResponse & { email?: string }>;

const publicInfo = (
  users: UserInfoMap,
  userId: string,
): ProductionOwnerResponse | null => {
  const user = users.get(userId);
  if (!user) return null;
  const { email: _email, ...info } = user;
  return info;
};

@Injectable()
export class ProductionCommunityService
  implements ProductionCommunityServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('ProductionCommunityRepositoryInterface')
    private readonly communityRepository: ProductionCommunityRepositoryInterface,
    @Inject('ProductionTicketPurchaseRepositoryInterface')
    private readonly purchaseRepository: ProductionTicketPurchaseRepositoryInterface,
    @Inject('ProductionServiceInterface')
    private readonly productionService: ProductionServiceInterface,
    private readonly accessService: ProductionAccessService,
  ) {}

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async inTransaction<T>(
    work: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  private async getProductionOrFail(productionId: string): Promise<Production> {
    const production = await this.productionRepository.findById(productionId);
    if (!production) throw new NotFoundException('Producción no encontrada');
    return production;
  }

  /**
   * El visitante tiene que poder ver el contenido del blog (alcance, clave,
   * moderación y reseña pendiente) y, si se indica, del ítem.
   */
  private async openForViewer(
    productionId: string,
    userId: string | undefined,
    itemId?: string,
  ) {
    const production = await this.getProductionOrFail(productionId);
    const viewer = await this.accessService.buildViewerContext(
      production,
      userId,
    );
    const decision = this.accessService.evaluateProduction(production, viewer);
    if (!decision.listed) {
      throw new NotFoundException('Producción no encontrada');
    }
    if (!decision.canViewContent) {
      throw new ForbiddenException('No tenés acceso al contenido de este blog');
    }
    if (itemId) {
      const item = await this.accessService.evaluateItemById(
        production,
        itemId,
        viewer,
      );
      if (!item?.decision.listed) {
        throw new NotFoundException('Elemento no encontrado');
      }
      if (!item.decision.canViewContent) {
        throw new ForbiddenException('No tenés acceso a este contenido');
      }
    }
    return { production, viewer };
  }

  private toReviewResponse(
    review: ProductionReview,
    users: UserInfoMap,
  ): ProductionReviewResponse {
    return { ...review, authorInfo: publicInfo(users, review.author) };
  }

  private async viewReview(review: ProductionReview) {
    const users = await this.productionRepository.findUsersInfo([review.author]);
    return this.toReviewResponse(review, users);
  }

  private toCommentResponse(
    comment: ProductionComment,
    users: UserInfoMap,
    responses: Map<string, ProductionComment>,
  ): ProductionCommentResponse {
    const response = comment.response ? responses.get(comment.response) : null;
    return {
      _id: comment._id,
      production: comment.production,
      item: comment.item,
      user: comment.user,
      userInfo: publicInfo(users, comment.user),
      comment: comment.comment,
      isEdited: comment.isEdited,
      response: response
        ? this.toCommentResponse(response, users, new Map())
        : null,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private async viewComment(comment: ProductionComment) {
    const responses = new Map<string, ProductionComment>();
    if (comment.response) {
      const [reply] = await this.communityRepository.findCommentsByIds([
        comment.response,
      ]);
      if (reply) responses.set(reply._id, reply);
    }
    const users = await this.productionRepository.findUsersInfo([
      comment.user,
      ...Array.from(responses.values()).map((reply) => reply.user),
    ]);
    return this.toCommentResponse(comment, users, responses);
  }

  // ---------------------------------------------------------------------------
  // Fans (FAN-01)
  // ---------------------------------------------------------------------------

  async becomeProductionFan(
    productionId: string,
    userId: string,
  ): Promise<ProductionResponse> {
    const { production, viewer } = await this.openForViewer(productionId, userId);
    if (viewer.role === ProductionRole.admin) {
      throw new BadRequestException('No podés ser fan de tu propio blog');
    }
    const added = await this.communityRepository.addFan(productionId, userId);
    if (added) {
      await this.productionRepository.incrementFansCount(production.getId!, 1);
    }
    return this.productionService.findProductionById(productionId, userId);
  }

  async stopBeingProductionFan(
    productionId: string,
    userId: string,
  ): Promise<ProductionResponse> {
    const production = await this.getProductionOrFail(productionId);
    const removed = await this.communityRepository.removeFan(
      productionId,
      userId,
    );
    if (removed) {
      await this.productionRepository.incrementFansCount(production.getId!, -1);
    }
    return this.productionService.findProductionById(productionId, userId);
  }

  async getProductionFans(
    productionId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProductionFanListResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canViewInsights',
    );
    const pages = paging(page, limit);
    const { fans, total } = await this.communityRepository.listFans(
      productionId,
      pages.page,
      pages.limit,
    );
    const users = await this.productionRepository.findUsersInfo(
      fans.map((fan) => fan.user),
    );
    return {
      fans: fans.map((fan) => ({
        user: fan.user,
        userInfo: publicInfo(users, fan.user),
        createdAt: fan.createdAt,
      })),
      total,
      hasMore: pages.page * pages.limit < total,
    };
  }

  async getMyFanProductions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProductionListResponse> {
    const pages = paging(page, limit);
    const { productionIds, total } =
      await this.communityRepository.listFanProductionIds(
        userId,
        pages.page,
        pages.limit,
      );
    return {
      productions: await this.productionService.findProductionsByIds(
        productionIds,
        userId,
      ),
      hasMore: pages.page * pages.limit < total,
    };
  }

  // ---------------------------------------------------------------------------
  // Reseñas (REV-01/02)
  // ---------------------------------------------------------------------------

  async createProductionReview(
    input: ProductionReviewInput,
    userId: string,
  ): Promise<ProductionReviewResponse> {
    const { production, viewer } = await this.openForViewer(
      input.productionId,
      userId,
    );
    if (viewer.role !== ProductionRole.visitor) {
      throw new BadRequestException('No podés reseñar un blog del que sos parte');
    }
    // REV-01: reseña quien accedió mediante un ticket.
    const hasTicket = await this.purchaseRepository.hasPurchaseForProduction(
      userId,
      production.getId!,
    );
    if (!hasTicket) {
      throw new ForbiddenException(
        'Sólo quienes accedieron con un ticket pueden reseñar esta producción',
      );
    }

    const rating = Math.round(input.rating);
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('La calificación tiene que ser de 1 a 5');
    }
    const text = requireNonEmpty(input.review, 'La reseña');

    try {
      const reviewId = await this.inTransaction(async (session) => {
        const id = await this.communityRepository.createReview(
          {
            production: production.getId!,
            author: userId,
            review: text,
            rating,
          },
          session,
        );
        await this.productionRepository.incrementRating(
          production.getId!,
          rating,
          1,
          session,
        );
        // REV-02: la reseña libera el bloqueo de compras y visitas.
        await this.purchaseRepository.markReviewed(
          userId,
          production.getId!,
          new Date(),
          session,
        );
        return id;
      });
      const review = await this.communityRepository.findReviewById(reviewId);
      return this.viewReview(review!);
    } catch (error: any) {
      if (error?.code === DUPLICATE_KEY) {
        throw new BadRequestException(
          'Ya reseñaste esta producción. Podés editar tu reseña.',
        );
      }
      throw error;
    }
  }

  async updateProductionReview(
    reviewId: string,
    input: ProductionReviewUpdateInput,
    userId: string,
  ): Promise<ProductionReviewResponse> {
    const review = await this.communityRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.author !== userId) {
      throw new UnauthorizedException('Sólo el autor puede editar su reseña');
    }

    const fields: { review?: string; rating?: number } = {};
    if (input.review !== undefined) {
      fields.review = requireNonEmpty(input.review, 'La reseña');
    }
    if (input.rating !== undefined) {
      fields.rating = Math.round(input.rating);
      if (fields.rating < 1 || fields.rating > 5) {
        throw new BadRequestException('La calificación tiene que ser de 1 a 5');
      }
    }

    const updated = await this.inTransaction(async (session) => {
      const result = await this.communityRepository.updateReview(
        reviewId,
        fields,
        session,
      );
      if (fields.rating !== undefined && fields.rating !== review.rating) {
        await this.productionRepository.incrementRating(
          review.production,
          fields.rating - review.rating,
          0,
          session,
        );
      }
      return result;
    });
    return this.viewReview(updated!);
  }

  async deleteProductionReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.communityRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.author !== userId) {
      throw new UnauthorizedException('Sólo el autor puede borrar su reseña');
    }
    await this.inTransaction(async (session) => {
      await this.communityRepository.deleteReview(reviewId, session);
      await this.productionRepository.incrementRating(
        review.production,
        -review.rating,
        -1,
        session,
      );
    });
  }

  async getProductionReviews(
    productionId: string,
    userId: string | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionReviewListResponse> {
    const production = await this.getProductionOrFail(productionId);
    const viewer = await this.accessService.buildViewerContext(
      production,
      userId,
    );
    if (!this.accessService.evaluateProduction(production, viewer).listed) {
      throw new NotFoundException('Producción no encontrada');
    }
    const pages = paging(page, limit);
    const { reviews, total } = await this.communityRepository.listReviews(
      productionId,
      pages.page,
      pages.limit,
    );
    const users = await this.productionRepository.findUsersInfo(
      reviews.map((review) => review.author),
    );
    return {
      reviews: reviews.map((review) => this.toReviewResponse(review, users)),
      total,
      hasMore: pages.page * pages.limit < total,
      rating: production.getRating,
    };
  }

  /** REV-02: el prompt persistente de reseña pendiente. */
  async getMyPendingProductionReview(
    userId: string,
  ): Promise<ProductionPendingReviewResponse | null> {
    const pending = await this.purchaseRepository.findPendingReview(userId);
    if (!pending) return null;
    return {
      productionId: pending.production,
      productionTitle: pending.productionTitle,
      purchaseId: pending._id,
      firstAccessAt: pending.firstAccessAt,
    };
  }

  // ---------------------------------------------------------------------------
  // Comentarios (REV-01)
  // ---------------------------------------------------------------------------

  async createProductionComment(
    input: ProductionCommentInput,
    userId: string,
  ): Promise<ProductionCommentResponse> {
    await this.openForViewer(input.productionId, userId, input.itemId);
    const commentId = await this.communityRepository.createComment({
      production: input.productionId,
      item: input.itemId ?? null,
      user: userId,
      comment: requireNonEmpty(input.comment, 'El comentario'),
      isReply: false,
    });
    const comment = await this.communityRepository.findCommentById(commentId);
    return this.viewComment(comment!);
  }

  /** El staff del blog responde un comentario (patrón PostComment.response). */
  async replyProductionComment(
    commentId: string,
    text: string,
    userId: string,
  ): Promise<ProductionCommentResponse> {
    const parent = await this.communityRepository.findCommentById(commentId);
    if (!parent || parent.isReply) {
      throw new NotFoundException('Comentario no encontrado');
    }
    const production = await this.getProductionOrFail(parent.production);
    await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );
    if (parent.response) {
      throw new BadRequestException(
        'El comentario ya tiene una respuesta. Editala en lugar de crear otra.',
      );
    }
    const comment = requireNonEmpty(text, 'La respuesta');

    await this.inTransaction(async (session) => {
      const replyId = await this.communityRepository.createComment(
        {
          production: parent.production,
          item: parent.item,
          user: userId,
          comment,
          isReply: true,
        },
        session,
      );
      await this.communityRepository.setCommentResponse(
        parent._id,
        replyId,
        session,
      );
    });
    const updated = await this.communityRepository.findCommentById(commentId);
    return this.viewComment(updated!);
  }

  async updateProductionComment(
    commentId: string,
    text: string,
    userId: string,
  ): Promise<ProductionCommentResponse> {
    const comment = await this.communityRepository.findCommentById(commentId);
    if (!comment) throw new NotFoundException('Comentario no encontrado');
    if (comment.user !== userId) {
      throw new UnauthorizedException('Sólo el autor puede editar su comentario');
    }
    const updated = await this.communityRepository.updateComment(
      commentId,
      requireNonEmpty(text, 'El comentario'),
    );
    return this.viewComment(updated!);
  }

  /** Lo borra su autor o el staff del blog (moderación); arrastra su respuesta. */
  async deleteProductionComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.communityRepository.findCommentById(commentId);
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.user !== userId) {
      const production = await this.getProductionOrFail(comment.production);
      const role = await this.accessService.resolveRole(production, userId);
      if (!ProductionPermissions.canEditContent(role)) {
        throw new UnauthorizedException(
          'No tenés permisos para borrar este comentario',
        );
      }
    }

    await this.inTransaction(async (session) => {
      const ids = [comment._id, ...(comment.response ? [comment.response] : [])];
      await this.communityRepository.deleteComments(ids, session);
      if (comment.isReply) {
        await this.communityRepository.clearResponseReferences(
          comment._id,
          session,
        );
      }
    });
  }

  async getProductionComments(
    productionId: string,
    itemId: string | undefined,
    userId: string | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionCommentListResponse> {
    await this.openForViewer(productionId, userId, itemId);
    const pages = paging(page, limit);
    const { comments, total } = await this.communityRepository.listComments(
      productionId,
      itemId ?? null,
      pages.page,
      pages.limit,
    );
    const replies = await this.communityRepository.findCommentsByIds(
      comments
        .map((comment) => comment.response)
        .filter((id): id is string => !!id),
    );
    const responses = new Map(replies.map((reply) => [reply._id, reply]));
    const users = await this.productionRepository.findUsersInfo([
      ...comments.map((comment) => comment.user),
      ...replies.map((reply) => reply.user),
    ]);
    return {
      comments: comments.map((comment) =>
        this.toCommentResponse(comment, users, responses),
      ),
      total,
      hasMore: pages.page * pages.limit < total,
    };
  }
}
