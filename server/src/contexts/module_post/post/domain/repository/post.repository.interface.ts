import { ClientSession } from 'mongoose';
import { Post } from '../entity/post.entity';
import { PostUpdateDto } from '../entity/dto/post.update.dto';
import { UserLocation } from '../entity/models_graphql/HTTP-REQUEST/post.location.request';

export interface PostRepositoryInterface {
  create(
    post: Post,
    options?: { session?: ClientSession },
  ): Promise<String>;
  deletePostById(id: string): Promise<any>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<void>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
  ): Promise<any>;
  findMatchPost(postType: string, searchTerm: string): Promise<void>;
  findFriendPosts(postType: string, userRequestId: string, userRelationMap: Map<string, string>, page: number, limit: number, searchTerm?: string): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string,newDate:Date): Promise<void>;
  makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void>;
  removeReactionFromPost(userRequestId: string, _id: string): Promise<any>;
}
