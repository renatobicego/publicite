import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';
import { PostRequest } from '../dto/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from '../dto/HTTP-REQUEST/post.update.request';
import { PostResponse } from '../dto/HTTP-RESPONSE/post.response';

export interface PostAdapterInterface {
  create(post: PostRequest): Promise<PostResponse>;
  deletePostById(id: string): Promise<void>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<void>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    searchTerm?: string,
  ): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateRequest,
    id: string,
    cookie?: any,
  ): Promise<PostUpdateDto>;
}
