import { BadRequestException, Inject } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Date } from 'mongoose';



import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { PostUpdateDto } from '../../domain/entity/dto/post.update.dto';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostFactory } from '../post-factory/post.factory';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { removeAccents_removeEmojisAndToLowerCase } from '../../domain/utils/normalice.data';
import { checkStopWordsAndReturnSearchQuery, SearchType } from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';
import { makeUserRelationMapWithoutHierarchy, makeUserRelationHierarchyMap } from 'src/contexts/module_shared/utils/functions/makeUserRelationHierarchyMap';
import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';
import { PostLimitResponseGraphql } from '../../domain/entity/models_graphql/HTTP-RESPONSE/post.limit.response.graphql';
import { PostBehaviourType } from '../../domain/entity/enum/postBehaviourType.enum';
import { Visibility_Of_Find } from '../../domain/entity/enum/post-visibility.enum';
import { VisibilityEnum } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.update.request';
import { PostComment } from '../../domain/entity/postComment.entity';


export class PostService implements PostServiceInterface {
  constructor(
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) { }



  async activateOrDeactivatePost(_id: string, activate: boolean, postBehaviourType: PostBehaviourType, userRequestId: string): Promise<any> {
    try {
      if (activate) {
        const isAllowedToActivate = await this.userService.isThisUserAllowedToPost(userRequestId, postBehaviourType);

        if (!isAllowedToActivate) {
          throw new BadRequestException('No es posible activar el post, agostaste el limite de posts según tu plan');
        }
        await this.postRepository.activateOrDeactivatePost(_id, true);
      } else {
        await this.postRepository.activateOrDeactivatePost(_id, false);
      }
    } catch (error: any) {
      throw error;
    }
  }



  async create(post: PostRequest): Promise<any> {
    const postType = post.postType.toLowerCase();
    if (!postType) throw new Error('Post type is required');
    const postFactory = PostFactory.getInstance(this.logger);
    const postMapped = postFactory.createPost(postType as PostType, post);

    const author = postMapped.getAuthor ?? undefined;
    const postBehaviourType = postMapped.getPostBehaviourType ?? undefined;
    if (!author || !postBehaviourType) throw new Error('Author or postBehaviourType is required');

    const session = await this.connection.startSession();
    let newPostId: String;
    try {
      const newPostIdId = await session.withTransaction(async () => {

        const isThisUserAllowedToPost = await this.userService.isThisUserAllowedToPost(
          author,
          postBehaviourType,
        )

        if (!isThisUserAllowedToPost) throw new Error('No es posible crear el post, agostaste el limite de posts según tu plan');

        //Post to save
        newPostId = await this.postRepository.create(postMapped, {
          session,
        });
        if (!newPostId) {
          throw new Error('Error al crear el post');
        }

        //Post to save in user
        await this.userService.saveNewPostInUser(newPostId, post.author, {
          session,
        });
        return newPostId;
      });

      //Todo ok
      await session.commitTransaction();

      return {
        _id: newPostIdId,
      };
    } catch (error: any) {
      throw error;
    } finally {
      session.endSession();
    }
  }



  async deletePostById(id: string): Promise<void> {
    try {
      this.logger.log('Deleting post with id: ' + id);
      await this.postRepository.deletePostById(id);
    } catch (error: any) {
      this.logger.log('An error was ocurred deleting a post with id: ' + id);
      throw error;
    }
  }

  async desactivatePostByUserId(userId: string): Promise<void> {
    try {

      let totalLibresExceded = 0;
      let totalAgendaExceded = 0;
      const { agendaPostCount, librePostCount, totalAgendaPostLimit, totalLibrePostLimit } = await this.userService.getPostAndLimitsFromUserByUserId(userId);
      if (totalLibrePostLimit - librePostCount < 0) {
        totalLibresExceded = Math.abs(totalLibrePostLimit - librePostCount);
      }
      if (totalAgendaPostLimit - agendaPostCount < 0) {
        totalAgendaExceded = Math.abs(totalAgendaPostLimit - agendaPostCount);
      }
      const criteria = {
        agenda: totalAgendaExceded,
        libre: totalLibresExceded
      }
      this.logger.log(`totalLibresExceded: ${totalLibresExceded}, totalAgendaExceded: ${totalAgendaExceded}`);
      if (totalAgendaExceded === 0 && totalLibresExceded === 0) return;
      await this.postRepository.desactivateAllPost(userId, criteria);
    } catch (error: any) {
      throw error;
    }
  }



  async deleteCommentById(id: string, userRequestId: string, isAuthorOfPost: boolean, isReply: boolean): Promise<void> {
    try {
      await this.postRepository.deleteCommentById(id, userRequestId, isAuthorOfPost, isReply);
    } catch (error: any) {
      throw error;
    }
  }





  async findMatchPost(postType: string, searchTerm: string): Promise<void> {
    try {
      const termsWithOutAccentsAndEmojis = removeAccents_removeEmojisAndToLowerCase(searchTerm);
      const searchTermNormalized = checkStopWordsAndReturnSearchQuery(termsWithOutAccentsAndEmojis, SearchType.post)
      if (searchTermNormalized === null) return
      return await this.postRepository.findMatchPost(postType, searchTermNormalized);
    } catch (error: any) {
      throw error;
    }
  }

  async findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
    userRequestId?: string,
  ): Promise<any> {
    try {
      return await this.postRepository.findAllPostByPostType(
        page,
        limit,
        postType,
        userLocation,
        searchTerm,
        userRequestId
      );
    } catch (error: any) {
      throw error;
    }
  }


  async findPostsByAuthorId(id: string): Promise<any> {
    try {
      this.logger.log('Finding posts by author id: ' + id);
      return await this.postRepository.findPostsByAuthorId(id);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }
  async findPostById(id: string): Promise<void> {
    try {
      this.logger.log('Finding posts by  id: ' + id);
      return await this.postRepository.findPostById(id);

    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }


  async findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, visibility: Visibility_Of_Find, searchTerm?: string): Promise<any> {
    try {
      let relationMap: Map<string, String[]> = await this.makeUserRelationMap(userRequestId, visibility)
      if (relationMap.size === 0 || relationMap === null || !relationMap) return { posts: [], hasMore: false };
      return await this.postRepository.findFriendPosts(postType, relationMap, page, limit, searchTerm)

    } catch (error: any) {
      throw error;
    }
  }



  async findPostOfGroupMembers(membersId: any[], conditionsOfSearch: any, userLocation: UserLocation, limit: number, page: number): Promise<PostsMemberGroupResponse | null> {
    try {
      return await this.postRepository.findPostOfGroupMembers(membersId, conditionsOfSearch, userLocation, limit, page)
    } catch (error: any) {
      throw error;
    }
  }


  async findPostByIdAndCategoryPostsRecomended(id: string): Promise<any> {
    try {
      return await this.postRepository.findPostByIdAndCategoryPostsRecomended(id)
    } catch (error: any) {
      throw error;
    }
  }


  async getPostAndContactLimit(userRequestId: string): Promise<PostLimitResponseGraphql> {
    try {
      return await this.userService.getPostAndContactLimit(userRequestId)
    } catch (error: any) {
      throw error;
    }
  }




  async makeUserRelationMap(userRequestId: string, visibility: Visibility_Of_Find): Promise<any> {
    const userActiveRelation = await this.userService.getActiveRelationOfUser(userRequestId)

    if (!userActiveRelation || userActiveRelation === null) return

    if (visibility === Visibility_Of_Find.hierarchy) {
      return makeUserRelationHierarchyMap(userActiveRelation, userRequestId)
    } else {
      return makeUserRelationMapWithoutHierarchy(userActiveRelation, userRequestId, visibility)
    }


  }


  async makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void> {
    try {
      this.logger.log('Setting reactions to posts id: ' + postId);
      return await this.postRepository.makeReactionSchemaAndSetReactionToPost(postId, reaction, session);
    } catch (error: any) {
      this.logger.error('An error was ocurred setting reactions to posts id: ' + postId);
      throw error;
    }
  }


  async makeResponseAndPutResponseInComment(author: string, commentId: string, response: string, session: any): Promise<any> {
    try {

      const newResponse = new PostComment(author, response, false)
      const commentResponse = await this.postRepository.savePostComment(newResponse, session)
      const commentResponseId = commentResponse._id
      if (!commentResponseId) throw new Error('Error al crear la respuesta in makeCommentSchemaAndPutCommentInPost')
      await this.postRepository.setResponseOnComment(commentId, commentResponseId, session)
      return commentResponse;
    } catch (error: any) {
      throw error;
    }
  }


  async makeCommentSchemaAndPutCommentInPost(postId: string, userCommentId: string, comment: string, session: any): Promise<any> {
    try {

      const newComment = new PostComment(userCommentId, comment, false)
      const postComment = await this.postRepository.savePostComment(newComment, session)
      const postCommentId = postComment._id
      if (!postCommentId) throw new Error('Error al crear el comentario in makeCommentSchemaAndPutCommentInPost')
      await this.postRepository.setCommenOnPost(postId, postCommentId, session)
      return postComment
    } catch (error: any) {
      throw error;
    }
  }



  async updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any> {
    try {
      return await this.postRepository.updatePostById(postUpdate, id, postType);
    } catch (error: any) {
      throw error;
    }
  }

  async updateEndDateFromPostById(postId: string, userRequestId: string, newDate: Date): Promise<void> {
    try {
      this.logger.log('Updating end date from post with id: ' + postId);
      return await this.postRepository.updateEndDateFromPostById(postId, userRequestId, newDate);
    } catch (error: any) {
      throw error;
    }
  }

  async updateBehaviourType(_id: string, postBehaviourType: PostBehaviourType, userRequestId: string, visibility: VisibilityEnum): Promise<any> {
    try {

      this.logger.log('Updating behaviour_type from post with id: ' + _id);
      const isAllawedToChange = await this.userService.isThisUserAllowedToPost(userRequestId, postBehaviourType);

      if (isAllawedToChange) {
        const makeObjectUpdate = {
          postBehaviourType: postBehaviourType,
          visibility: visibility,
        }

        return await this.postRepository.updateBehaviourType(_id, makeObjectUpdate);
      } else {
        throw new BadRequestException('You are not allowed to change behaviour_type, please upgrade your plan');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateCommentById(id: string, comment: string, userRequestId: string): Promise<void> {
    try {
      this.logger.log('Updating comment from post with id: ' + id);
      return await this.postRepository.updateCommentById(id, comment, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async removeReactionFromPost(userRequestId: string, _id: string): Promise<any> {
    try {
      this.logger.log('Removing reaction from post with id: ' + _id);
      await this.postRepository.removeReactionFromPost(userRequestId, _id);
    } catch (error: any) {
      this.logger.error('An error was ocurred removing reaction from post with id: ' + _id);
      throw error;
    }
  }





}
