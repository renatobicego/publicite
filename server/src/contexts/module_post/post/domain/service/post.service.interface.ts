import { PostRequest } from "../entity/models_graphql/HTTP-REQUEST/post.request";
import { PostUpdateDto } from "../entity/dto/post.update.dto";
import { UserLocation } from "../entity/models_graphql/HTTP-REQUEST/post.location.request";
import { PostsMemberGroupResponse } from "src/contexts/module_shared/sharedGraphql/group.posts.member.response";
import { PostLimitResponseGraphql } from "../entity/models_graphql/HTTP-RESPONSE/post.limit.response.graphql";
import { PostBehaviourType } from "../entity/enum/postBehaviourType.enum";
import { Visibility } from "../entity/enum/post-visibility.enum";




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
  findPostOfGroupMembers(membersId: any[], conditionsOfSearch: any, userLocation: UserLocation, limit: number, page: number): Promise<PostsMemberGroupResponse | null>
  getLimitPostOfUser(userRequestId: string): Promise<PostLimitResponseGraphql>
  makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
    cookie?: any,
  ): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string, newDate: Date): Promise<void>;
  updateBehaviourType(_id: string, postBehaviourType: PostBehaviourType, userRequestId: string, visibility: Visibility): Promise<any>
  removeReactionFromPost(userRequestId: string, _id: string): Promise<any>;

}
