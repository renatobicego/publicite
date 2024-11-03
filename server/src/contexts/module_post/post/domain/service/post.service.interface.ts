import { PostUpdateDto } from '../../entity/dto/post.update.dto';
import { Post } from '../../entity/post.entity';

export interface PostServiceInterface {
  create(post: Post): Promise<Post>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<any>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    searchTerm?: string,
  ): Promise<void>;
  deletePostById(id: string): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
    cookie?: any,
  ): Promise<any>;
}