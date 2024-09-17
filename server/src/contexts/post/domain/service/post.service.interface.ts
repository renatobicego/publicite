import { Post } from '../entity/post.entity';

export interface PostServiceInterface {
  create(post: Post): Promise<Post>;
}
