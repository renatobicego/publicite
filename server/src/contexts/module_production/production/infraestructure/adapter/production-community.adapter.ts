import { Inject, Injectable } from '@nestjs/common';

import { ProductionCommunityAdapterInterface } from '../../application/adapter/production-community.adapter.interface';
import { ProductionCommunityServiceInterface } from '../../domain/service/production-community.service.interface';
import {
  ProductionCommentInput,
  ProductionReviewInput,
  ProductionReviewUpdateInput,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-community.request';

@Injectable()
export class ProductionCommunityAdapter
  implements ProductionCommunityAdapterInterface
{
  constructor(
    @Inject('ProductionCommunityServiceInterface')
    private readonly communityService: ProductionCommunityServiceInterface,
  ) {}

  becomeProductionFan(productionId: string, userId: string) {
    return this.communityService.becomeProductionFan(productionId, userId);
  }

  stopBeingProductionFan(productionId: string, userId: string) {
    return this.communityService.stopBeingProductionFan(productionId, userId);
  }

  getProductionFans(
    productionId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    return this.communityService.getProductionFans(
      productionId,
      userId,
      page,
      limit,
    );
  }

  getMyFanProductions(userId: string, page: number, limit: number) {
    return this.communityService.getMyFanProductions(userId, page, limit);
  }

  createProductionReview(input: ProductionReviewInput, userId: string) {
    return this.communityService.createProductionReview(input, userId);
  }

  updateProductionReview(
    reviewId: string,
    input: ProductionReviewUpdateInput,
    userId: string,
  ) {
    return this.communityService.updateProductionReview(
      reviewId,
      input,
      userId,
    );
  }

  deleteProductionReview(reviewId: string, userId: string) {
    return this.communityService.deleteProductionReview(reviewId, userId);
  }

  getProductionReviews(
    productionId: string,
    userId: string | undefined,
    page: number,
    limit: number,
  ) {
    return this.communityService.getProductionReviews(
      productionId,
      userId,
      page,
      limit,
    );
  }

  getMyPendingProductionReview(userId: string) {
    return this.communityService.getMyPendingProductionReview(userId);
  }

  createProductionComment(input: ProductionCommentInput, userId: string) {
    return this.communityService.createProductionComment(input, userId);
  }

  replyProductionComment(commentId: string, comment: string, userId: string) {
    return this.communityService.replyProductionComment(
      commentId,
      comment,
      userId,
    );
  }

  updateProductionComment(commentId: string, comment: string, userId: string) {
    return this.communityService.updateProductionComment(
      commentId,
      comment,
      userId,
    );
  }

  deleteProductionComment(commentId: string, userId: string) {
    return this.communityService.deleteProductionComment(commentId, userId);
  }

  getProductionComments(
    productionId: string,
    itemId: string | undefined,
    userId: string | undefined,
    page: number,
    limit: number,
  ) {
    return this.communityService.getProductionComments(
      productionId,
      itemId,
      userId,
      page,
      limit,
    );
  }
}
