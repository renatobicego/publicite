import { PostCategoryRequest } from './dto/HTTP-REQUEST/post.category.request';
import { PostCategoryResponse } from './dto/HTTP-RESPONSE/post.category.response';

export interface PostCategoryAdapterInterface {
  saveCategory(category: PostCategoryRequest): Promise<PostCategoryResponse>;
  findAllCategoryPost(): Promise<PostCategoryResponse[]>;
}
