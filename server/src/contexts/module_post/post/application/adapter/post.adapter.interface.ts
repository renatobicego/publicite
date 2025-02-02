import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostUpdateRequest, VisibilityEnum } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.update.request';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostLimitResponseGraphql } from '../../domain/entity/models_graphql/HTTP-RESPONSE/post.limit.response.graphql';
import { PostBehaviourType } from '../../domain/entity/enum/postBehaviourType.enum';
import { Visibility_Of_Find } from '../../domain/entity/enum/post-visibility.enum';
import { Date } from 'mongoose';


export interface PostAdapterInterface {
  activateOrDeactivatePost(_id: string, activate: boolean, postBehaviourType: PostBehaviourType, userRequestId: string): Promise<any>;
  create(post: PostRequest): Promise<any>;
  deletePostById(id: string): Promise<void>;
  desactivatePostByUserId(id: string): Promise<void>;
  deleteCommentById(id: string, userRequestId: string, isAuthorOfPost: boolean): Promise<void>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<void>;
  findPostByIdAndCategoryPostsRecomended(id: string): Promise<any>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
    userRequestId?: string,
  ): Promise<void>;
  findMatchPost(postType: string, searchTerm: string): Promise<void>;
  findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, visibility: Visibility_Of_Find, searchTerm?: string): Promise<void>;
  getPostAndContactLimit(userRequestId: string): Promise<PostLimitResponseGraphql>;
  updatePostById(
    postUpdate: PostUpdateRequest,
    id: string,
    cookie?: any,
  ): Promise<PostUpdateDto>;
  updateBehaviourType(_id: string, postBehaviourType: PostBehaviourType, userRequestId: string, visibility: VisibilityEnum): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string, newDate: Date): Promise<void>;
  updateCommentById(id: string, comment: string, userRequestId: string): Promise<void>;
  removeReactionFromPost(userRequestId: string, _id: string): Promise<any>;
}
