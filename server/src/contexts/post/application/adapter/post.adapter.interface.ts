import { PostRequest } from './dto/post.request';
import { PostResponse } from './dto/post.response';

export interface PostAdapterInterface {
  create(post: PostRequest): Promise<PostResponse>;
}
