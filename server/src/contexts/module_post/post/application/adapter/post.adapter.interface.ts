import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.update.request';


export interface PostAdapterInterface {
  create(post: PostRequest): Promise<any>;
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
  updateEndDateFromPostById(postId: string, userRequestId: string): Promise<void>;
}
