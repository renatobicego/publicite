import { BadRequestException, Inject } from '@nestjs/common';

import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostAdapterInterface } from 'src/contexts/module_post/post/application/adapter/post.adapter.interface';
import {
  PostRequest,
} from 'src/contexts/module_post/post/domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from 'src/contexts/module_post/post/domain/entity/models_graphql/HTTP-REQUEST/post.update.request';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostLimitResponseGraphql } from '../../domain/entity/models_graphql/HTTP-RESPONSE/post.limit.response.graphql';
import { PostBehaviourType } from '../../domain/entity/enum/postBehaviourType.enum';
import { Visibility } from '../../domain/entity/enum/post-visibility.enum';


export class PostAdapter implements PostAdapterInterface {
  constructor(
    @Inject('PostServiceInterface')
    private readonly postService: PostServiceInterface,
    @Inject('PostMapperAdapterInterface')
    private readonly postMapper: PostMapperAdapterInterface,
    private readonly logger: MyLoggerService,
  ) { }



  async create(post: PostRequest): Promise<any> {
    try {
      return await this.postService.create(post);
    } catch (error: any) {
      throw error;
    }
  }


  async deletePostById(id: string): Promise<void> {
    try {
      await this.postService.deletePostById(id);
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
  ): Promise<void> {
    try {
      return await this.postService.findAllPostByPostType(
        page,
        limit,
        postType,
        userLocation,
        searchTerm,
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

  async findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, searchTerm: string): Promise<void> {
    try {
      return await this.postService.findFriendPosts(postType, userRequestId, page, limit, searchTerm);
    } catch (error: any) {
      throw error;
    }
  }



  async getLimitPostOfUser(userRequestId: string): Promise<PostLimitResponseGraphql> {
    try {
      return await this.postService.getLimitPostOfUser(userRequestId);
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

  async updateBehaviourType(_id: string, postBehaviourType: PostBehaviourType, userRequestId: string, visibility: Visibility): Promise<any> {
    try {
      if (postBehaviourType === PostBehaviourType.agenda) {
        if (visibility === undefined || visibility === null) {
          throw new BadRequestException("visibility is required when postBehaviourType is agenda");
        }
        if (visibility === Visibility.public) {
          throw new BadRequestException("visibility can't be public when postBehaviourType is agenda");
        }
      } else {
        visibility != Visibility.public ? visibility = Visibility.public : visibility = Visibility.public;
      }
      return await this.postService.updateBehaviourType(_id, postBehaviourType, userRequestId, visibility);
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
