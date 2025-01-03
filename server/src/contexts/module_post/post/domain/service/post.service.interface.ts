import { PostRequest } from "../entity/models_graphql/HTTP-REQUEST/post.request";
import { PostUpdateDto } from "../entity/dto/post.update.dto";
import { UserLocation } from "../entity/models_graphql/HTTP-REQUEST/post.location.request";



export interface PostServiceInterface {
  create(post: PostRequest): Promise<void>;
  deletePostById(id: string): Promise<void>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<any>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
  ): Promise<void>;
  findMatchPost(postType: string, searchTerm: string): Promise<void>;
  findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, searchTerm?: string): Promise<void>;
  makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
    cookie?: any,
  ): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string): Promise<void>;

}
