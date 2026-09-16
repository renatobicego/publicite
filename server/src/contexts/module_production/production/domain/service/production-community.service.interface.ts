import {
  ProductionCommentInput,
  ProductionReviewInput,
  ProductionReviewUpdateInput,
} from '../entity/models_graphql/HTTP-REQUEST/production-community.request';
import {
  ProductionCommentListResponse,
  ProductionCommentResponse,
  ProductionFanListResponse,
  ProductionPendingReviewResponse,
  ProductionReviewListResponse,
  ProductionReviewResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production-community.response';
import {
  ProductionListResponse,
  ProductionResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production.response';

/** Fans, reseñas y comentarios (§6). */
export interface ProductionCommunityServiceInterface {
  becomeProductionFan(
    productionId: string,
    userId: string,
  ): Promise<ProductionResponse>;
  stopBeingProductionFan(
    productionId: string,
    userId: string,
  ): Promise<ProductionResponse>;
  getProductionFans(
    productionId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProductionFanListResponse>;
  getMyFanProductions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProductionListResponse>;

  createProductionReview(
    input: ProductionReviewInput,
    userId: string,
  ): Promise<ProductionReviewResponse>;
  updateProductionReview(
    reviewId: string,
    input: ProductionReviewUpdateInput,
    userId: string,
  ): Promise<ProductionReviewResponse>;
  deleteProductionReview(reviewId: string, userId: string): Promise<void>;
  getProductionReviews(
    productionId: string,
    userId: string | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionReviewListResponse>;
  getMyPendingProductionReview(
    userId: string,
  ): Promise<ProductionPendingReviewResponse | null>;

  createProductionComment(
    input: ProductionCommentInput,
    userId: string,
  ): Promise<ProductionCommentResponse>;
  replyProductionComment(
    commentId: string,
    comment: string,
    userId: string,
  ): Promise<ProductionCommentResponse>;
  updateProductionComment(
    commentId: string,
    comment: string,
    userId: string,
  ): Promise<ProductionCommentResponse>;
  deleteProductionComment(commentId: string, userId: string): Promise<void>;
  getProductionComments(
    productionId: string,
    itemId: string | undefined,
    userId: string | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionCommentListResponse>;
}
