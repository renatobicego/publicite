import { PostUpdateDto } from '../../domain/entity/dto/post.update.dto';
import { PostRequest } from './dto/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from './dto/HTTP-REQUEST/post.update.request';
import { PostResponse } from './dto/HTTP-RESPONSE/post.response';

export interface PostAdapterInterface {
  create(post: PostRequest): Promise<PostResponse>;
  updatePostById(
    postUpdate: PostUpdateRequest,
    id: string,
    cookie?: any,
  ): Promise<PostUpdateDto>;

  deletePostById(id: string): Promise<void>;
}
