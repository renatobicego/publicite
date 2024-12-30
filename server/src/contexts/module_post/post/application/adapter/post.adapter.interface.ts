import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.update.request';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';


export interface PostAdapterInterface {
  create(post: PostRequest): Promise<any>;
  deletePostById(id: string): Promise<void>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<void>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
  ): Promise<void>;
  findMatchPost(postType: string, searchTerm: string): Promise<void>;
  findFriendPosts(postType: string, userRequestId: string, page: number, limit: number): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateRequest,
    id: string,
    cookie?: any,
  ): Promise<PostUpdateDto>;
  updateEndDateFromPostById(postId: string, userRequestId: string): Promise<void>;
}
