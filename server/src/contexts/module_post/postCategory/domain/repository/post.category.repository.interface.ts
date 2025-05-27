import { PostCategoryResponse } from '../../application/adapter/dto/HTTP-RESPONSE/post.category.response';
import { PostCategory } from '../entity/post.category.entity';

export interface PostCategoryRepositoryInterface {
  saveCategory(category: PostCategory): Promise<PostCategoryResponse>;
  findAllCategoryPost(): Promise<PostCategoryResponse[]>;
}
