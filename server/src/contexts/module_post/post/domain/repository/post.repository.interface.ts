import { ClientSession, Date } from 'mongoose';
import { Post } from '../entity/post.entity';
import { PostUpdateDto } from '../entity/dto/post.update.dto';
import { UserLocation } from '../entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';
import { PostBehaviourType } from '../entity/enum/postBehaviourType.enum';
import { VisibilityEnum } from '../entity/models_graphql/HTTP-REQUEST/post.update.request';
import { PostComment } from '../entity/postComment.entity';


export interface PostRepositoryInterface {
  findAllFriendsPosts(userRelationMap: Map<string, string[]>, page: number, limit: number, searchTerm?: string): Promise<void>;
  activateOrDeactivatePost(_id: string, activate: boolean): Promise<any>;
  create(
    post: Post,
    options?: { session?: ClientSession },
  ): Promise<string | null>;
  deletePostById(id: string): Promise<any>;
  desactivateAllPost(
    userId: string,
    criteria: { [key: string]: number },
  ): Promise<void>;
  deleteAccount(id: string): Promise<any>;
  deleteCommentById(
    id: string,
    userRequestId: string,
    isAuthorOfPost: boolean,
    isReply: boolean,
  ): Promise<void>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<void>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
    userRequestId?: string,
  ): Promise<any>;
  findAllPosts(
    page: number,
    limit: number,
    userLocation: UserLocation,
    searchTerm?: string,
    userRequestId?: string,
  ): Promise<any>;
  findMatchPost(postType: string, searchTerm: string): Promise<void>;
  findFriendPosts(
    postType: string,
    userRelationMap: Map<string, string[]>,
    page: number,
    limit: number,
    searchTerm?: string,
  ): Promise<void>;
  findPostOfGroupMembers(
    membersId: any[],
    conditionsOfSearch: any,
    userLocation: UserLocation,
    limit: number,
    page: number,
  ): Promise<PostsMemberGroupResponse | null>;
  findPostByIdAndCategoryPostsRecomended(id: string): Promise<any>;

  savePostComment(postComment: PostComment, session: any): Promise<any>;
  setCommenOnPost(
    postId: string,
    postCommentId: string,
    session: any,
  ): Promise<any>;
  setResponseOnComment(
    commentId: string,
    responseId: string,
    session: any,
  ): Promise<any>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any>;
  updateEndDateFromPostById(
    postId: string,
    userRequestId: string,
    newDate: Date,
  ): Promise<void>;
  updateBehaviourType(
    _id: string,
    objectUpdate: {
      postBehaviourType: PostBehaviourType;
      visibility: VisibilityEnum;
    },
  ): Promise<any>;
  updateCommentById(
    id: string,
    comment: string,
    userRequestId: string,
  ): Promise<void>;
  makeReactionSchemaAndSetReactionToPost(
    postId: string,
    reaction: { user: string; reaction: string },
    session: any,
  ): Promise<void>;
  removeReactionFromPost(userRequestId: string, _id: string): Promise<any>;
}
