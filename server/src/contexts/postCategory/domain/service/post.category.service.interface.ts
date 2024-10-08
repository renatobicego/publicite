import { PostCategoryRequest } from '../../application/adapter/dto/HTTP-REQUEST/post.category.request';
import { PostCategoryResponse } from '../../application/adapter/dto/HTTP-RESPONSE/post.category.response';

export interface PostCategoryServiceInterface {
  saveCategory(category: PostCategoryRequest): Promise<PostCategoryResponse>;
  findAllCategoryPost(): Promise<PostCategoryResponse[]>;
}
