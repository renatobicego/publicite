import {
  PostBulkDeleteInput,
  PostBulkPriceInput,
  PostBulkVisibilityInput,
  PostSeudoBaseFilters,
} from '../entity/models_graphql/HTTP-REQUEST/post-seudobase.request';
import {
  PostAuditLogResponse,
  PostBulkResultResponse,
  PostSeudoBaseResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/post-seudobase.response';

export interface PostSeudoBaseServiceInterface {
  getPostSeudoBase(
    userId: string,
    filters: PostSeudoBaseFilters | undefined,
    page: number,
    limit: number,
  ): Promise<PostSeudoBaseResponse>;

  bulkUpdatePostPrices(
    input: PostBulkPriceInput,
    userId: string,
  ): Promise<PostBulkResultResponse>;

  bulkUpdatePostVisibility(
    input: PostBulkVisibilityInput,
    userId: string,
  ): Promise<PostBulkResultResponse>;

  bulkDeletePosts(
    input: PostBulkDeleteInput,
    userId: string,
  ): Promise<PostBulkResultResponse>;

  getPostAuditLog(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PostAuditLogResponse>;
}
