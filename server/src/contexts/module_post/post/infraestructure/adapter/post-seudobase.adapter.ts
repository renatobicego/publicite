import { Inject, Injectable } from '@nestjs/common';

import { PostSeudoBaseAdapterInterface } from '../../application/adapter/post-seudobase.adapter.interface';
import { PostSeudoBaseServiceInterface } from '../../domain/service/post-seudobase.service.interface';
import {
  PostBulkDeleteInput,
  PostBulkPriceInput,
  PostBulkVisibilityInput,
  PostSeudoBaseFilters,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/post-seudobase.request';

@Injectable()
export class PostSeudoBaseAdapter implements PostSeudoBaseAdapterInterface {
  constructor(
    @Inject('PostSeudoBaseServiceInterface')
    private readonly seudoBaseService: PostSeudoBaseServiceInterface,
  ) {}

  getPostSeudoBase(
    userId: string,
    filters: PostSeudoBaseFilters | undefined,
    page: number,
    limit: number,
  ) {
    return this.seudoBaseService.getPostSeudoBase(userId, filters, page, limit);
  }

  bulkUpdatePostPrices(input: PostBulkPriceInput, userId: string) {
    return this.seudoBaseService.bulkUpdatePostPrices(input, userId);
  }

  bulkUpdatePostVisibility(input: PostBulkVisibilityInput, userId: string) {
    return this.seudoBaseService.bulkUpdatePostVisibility(input, userId);
  }

  bulkDeletePosts(input: PostBulkDeleteInput, userId: string) {
    return this.seudoBaseService.bulkDeletePosts(input, userId);
  }

  getPostAuditLog(userId: string, page: number, limit: number) {
    return this.seudoBaseService.getPostAuditLog(userId, page, limit);
  }
}
