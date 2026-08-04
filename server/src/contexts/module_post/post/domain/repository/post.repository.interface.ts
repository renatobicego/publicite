import { ClientSession, Date } from 'mongoose';
import { Post } from '../entity/post.entity';
import { PostUpdateDto } from '../entity/dto/post.update.dto';
import { UserLocation } from '../entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';
import { PostBehaviourType } from '../entity/enum/postBehaviourType.enum';
import { VisibilityEnum } from '../entity/models_graphql/HTTP-REQUEST/post.update.request';
import { PostComment } from '../entity/postComment.entity';


/** Criterios de búsqueda de candidatos para Match IA. */
export interface MatchCandidateCriteria {
  /** Keywords YA normalizadas (sin acentos, minúsculas), como searchTitle. */
  keywords: string[];
  categoryIds?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  postType?: string | null;
  /** No proponerle al usuario sus propios anuncios. */
  excludeAuthorId?: string;
  limit: number;
}

/** Candidato devuelto a Match IA: sólo lo que necesita el ranking y la card. */
export interface MatchCandidate {
  postId: string;
  title: string;
  description: string;
  price: number;
  postType: string;
  imageUrl: string | null;
  categoryLabels: string[];
}

export interface PostRepositoryInterface {
  /**
   * Candidatos para Match IA.
   *
   * IMPORTANTE: restringido a anuncios públicos y de comportamiento "libre".
   * Los anuncios de agenda sólo son visibles para la red del autor, y Match se
   * invoca sin contexto de relación, así que incluirlos filtraría contenido
   * privado a cualquiera que pida un match.
   */
  findCandidatesForMatch(
    criteria: MatchCandidateCriteria,
  ): Promise<MatchCandidate[]>;

  /** Resumen de un anuncio para usarlo como input de Match ("buscá similares a este"). */
  findPostSummaryForMatch(postId: string): Promise<MatchCandidate | null>;

  /** Resuelve labels de categoría a sus ObjectIds (para filtrar candidatos). */
  findCategoryIdsByLabels(labels: string[]): Promise<string[]>;

  /** true si el anuncio existe y su autor es el usuario indicado. */
  isPostAuthor(postId: string, userId: string): Promise<boolean>;

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
  findAllPostsGlobal(
    page: number,
    limit: number,
    userLocation: UserLocation,
    userRelationMap?: Map<string, string[]>,
    searchTerm?: string,
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
