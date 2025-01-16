import { PostRequest } from "../entity/models_graphql/HTTP-REQUEST/post.request";
import { PostUpdateDto } from "../entity/dto/post.update.dto";
import { UserLocation } from "../entity/models_graphql/HTTP-REQUEST/post.location.request";
import { PostsMemberGroupResponse } from "src/contexts/module_shared/sharedGraphql/group.posts.member.response";
import { PostLimitResponseGraphql } from "../entity/models_graphql/HTTP-RESPONSE/post.limit.response.graphql";
import { PostBehaviourType } from "../entity/enum/postBehaviourType.enum";
import { Visibility_Of_Find } from "../entity/enum/post-visibility.enum";
import { VisibilityEnum } from "../entity/models_graphql/HTTP-REQUEST/post.update.request";




export interface PostServiceInterface {
  activateOrDeactivatePost(_id: string, activate: boolean, postBehaviourType: PostBehaviourType, userRequestId: string): Promise<any>;
  create(post: PostRequest): Promise<void>;
  deletePostById(id: string): Promise<void>;
  deleteCommentById(id: string, userRequestId: string): Promise<void>;
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
  findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, visibility: Visibility_Of_Find, searchTerm?: string): Promise<void>;
  findPostOfGroupMembers(membersId: any[], conditionsOfSearch: any, userLocation: UserLocation, limit: number, page: number): Promise<PostsMemberGroupResponse | null>
  getLimitPostOfUser(userRequestId: string): Promise<PostLimitResponseGraphql>
  makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void>;
  makeCommentSchemaAndPutCommentInPost(postId: string, userCommentId: string, comment: string, session: any): Promise<any>;
  desactivateAllPost(userId: string): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
    cookie?: any,
  ): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string, newDate: Date): Promise<void>;
  updateBehaviourType(_id: string, postBehaviourType: PostBehaviourType, userRequestId: string, visibility: VisibilityEnum): Promise<any>
  updateCommentById(id: string, comment: string, userRequestId: string): Promise<void>;
  removeReactionFromPost(userRequestId: string, _id: string): Promise<any>;

}
