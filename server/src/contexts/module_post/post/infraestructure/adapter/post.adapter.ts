import { BadRequestException, Inject } from '@nestjs/common';
import { Date } from 'mongoose';

import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostAdapterInterface } from 'src/contexts/module_post/post/application/adapter/post.adapter.interface';
import {
  PostRequest,
} from 'src/contexts/module_post/post/domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostUpdateRequest, VisibilityEnum } from 'src/contexts/module_post/post/domain/entity/models_graphql/HTTP-REQUEST/post.update.request';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostLimitResponseGraphql } from '../../domain/entity/models_graphql/HTTP-RESPONSE/post.limit.response.graphql';
import { PostBehaviourType } from '../../domain/entity/enum/postBehaviourType.enum';
import { Visibility, Visibility_Of_Find } from '../../domain/entity/enum/post-visibility.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { downgrade_plan_post, post_deleted } from 'src/contexts/module_shared/event-emmiter/events';

export class PostAdapter implements PostAdapterInterface {
  constructor(
    @Inject('PostServiceInterface')
    private readonly postService: PostServiceInterface,
    @Inject('PostMapperAdapterInterface')
    private readonly postMapper: PostMapperAdapterInterface,
    private readonly logger: MyLoggerService,
    private eventEmitter: EventEmitter2,
  ) { }


  @OnEvent(downgrade_plan_post)
  async desactivatePostByUserId(id: string): Promise<any> {
    try {
      await this.postService.desactivatePostByUserId(id);
      return true;
    } catch (error: any) {
      throw error;
    }
  }



  async activateOrDeactivatePost(_id: string, activate: boolean, postBehaviourType: PostBehaviourType, userRequestId: string): Promise<any> {
    try {
      return await this.postService.activateOrDeactivatePost(_id, activate, postBehaviourType, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }



  async create(post: PostRequest): Promise<any> {
    try {
      return await this.postService.create(post);
    } catch (error: any) {
      throw error;
    }
  }


  async deletePostById(id: string): Promise<void> {
    try {
      this.eventEmitter.emit(
        post_deleted,
        id
      );
      await this.postService.deletePostById(id);
    } catch (error: any) {
      throw error;
    }
  }


  async deleteCommentById(id: string, userRequestId: string, isAuthorOfPost: boolean): Promise<void> {
    try {
      await this.postService.deleteCommentById(id, userRequestId, isAuthorOfPost);
    } catch (error: any) {
      throw error;
    }
  }


  async findPostsByAuthorId(id: string): Promise<void> {
    try {
      return await this.postService.findPostsByAuthorId(id);
    } catch (error: any) {
      throw error;
    }
  }
  async findPostById(id: string): Promise<any> {
    try {
      return await this.postService.findPostById(id);
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
  ): Promise<void> {
    try {
      return await this.postService.findAllPostByPostType(
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

  async findMatchPost(postType: string, searchTerm: string): Promise<void> {
    try {
      return await this.postService.findMatchPost(postType, searchTerm);
    } catch (error: any) {
      throw error;
    }
  }

  async findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, visibility: Visibility_Of_Find, searchTerm?: string): Promise<void> {
    try {
      return await this.postService.findFriendPosts(postType, userRequestId, page, limit, visibility, searchTerm);
    } catch (error: any) {
      throw error;
    }
  }

  async findPostByIdAndCategoryPostsRecomended(id: string, category: string, userLocation: UserLocation): Promise<any> {
    try {
      return await this.postService.findPostByIdAndCategoryPostsRecomended(id, category, userLocation)
    } catch (error: any) {
      throw error;
    }
  }



  async getPostAndContactLimit(userRequestId: string): Promise<PostLimitResponseGraphql> {
    try {
      return await this.postService.getPostAndContactLimit(userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async updatePostById(
    postUpdate: PostUpdateRequest,
    id: string,
  ): Promise<any> {
    try {
      this.logger.log('We are updating a post with id: ' + id);
      const { postType } = postUpdate;
      const postMapped = this.postMapper.requestUpdateToEntity(postUpdate);
      this.logger.log('Post mapped succesfully');
      return await this.postService.updatePostById(postMapped, id, postType);
    } catch (error: any) {
      this.logger.log('An error was ocurred updating a post with id: ' + id);
      throw error;
    }
  }

  async updateEndDateFromPostById(postId: string, userRequestId: string, newDate: Date): Promise<void> {
    try {
      return this.postService.updateEndDateFromPostById(postId, userRequestId, newDate);
    } catch (error: any) {
      throw error;
    }
  }

  async updateBehaviourType(_id: string, postBehaviourType: PostBehaviourType, userRequestId: string, visibility: VisibilityEnum): Promise<any> {
    try {
      if (postBehaviourType === PostBehaviourType.agenda) {
        if (visibility === undefined || visibility === null) {
          throw new BadRequestException("visibility is required when postBehaviourType is agenda");
        }
        if (visibility.post === Visibility.public) {
          throw new BadRequestException("visibility can't be public when postBehaviourType is agenda");
        }
      } else {
        visibility.post != Visibility.public ? visibility.post = Visibility.public : visibility.post = Visibility.public;
      }
      return await this.postService.updateBehaviourType(_id, postBehaviourType, userRequestId, visibility);
    } catch (error: any) {
      throw error;
    }
  }


  async updateCommentById(id: string, comment: string, userRequestId: string): Promise<any> {
    try {
      return await this.postService.updateCommentById(id, comment, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async removeReactionFromPost(userRequestId: string, _id: string): Promise<any> {
    try {
      await this.postService.removeReactionFromPost(userRequestId, _id);
    } catch (error: any) {
      throw error;
    }
  }


}
