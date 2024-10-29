import { Inject } from '@nestjs/common';
import { error } from 'console';

import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/post/adapter/mapper/post.adapter.mapper.interface';
import { PostAdapterInterface } from 'src/contexts/module_post/post/application/post/adapter/post.adapter.interface';
import {
  PostRequest,
  PostGoodRequest,
  PostServiceRequest,
  PostPetitionRequest,
} from 'src/contexts/module_post/post/application/post/dto/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from 'src/contexts/module_post/post/application/post/dto/HTTP-REQUEST/post.update.request';
import { PostResponse } from 'src/contexts/module_post/post/application/post/dto/HTTP-RESPONSE/post.response';
import { PostType } from 'src/contexts/module_post/post/domain/post/entity/enum/post-type.enum';
import { PostServiceInterface } from 'src/contexts/module_post/post/domain/post/service/post.service.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class PostAdapter implements PostAdapterInterface {
  constructor(
    @Inject('PostServiceInterface')
    private readonly postService: PostServiceInterface,

    @Inject('PostMapperAdapterInterface')
    private readonly postMapper: PostMapperAdapterInterface,
    private readonly logger: MyLoggerService,
  ) {}
  async create(post: PostRequest): Promise<PostResponse> {
    try {
      let postMapped;
      let postPosted;

      switch (post.postType.toLowerCase()) {
        case PostType.good.toLocaleLowerCase():
          this.logger.log('We are creating a good post');
          postMapped = this.postMapper.requestToEntity(post as PostGoodRequest);
          postPosted = await this.postService.create(postMapped);
          return this.postMapper.entityToResponse(postPosted);

        case PostType.service.toLocaleLowerCase():
          this.logger.log('We are creating a service post');
          postMapped = this.postMapper.requestToEntity(
            post as PostServiceRequest,
          );
          postPosted = await this.postService.create(postMapped);
          return this.postMapper.entityToResponse(postPosted);

        case PostType.petition.toLocaleLowerCase():
          this.logger.log('We are creating a service post');
          postMapped = this.postMapper.requestToEntity(
            post as PostPetitionRequest,
          );
          postPosted = await this.postService.create(postMapped);
          return this.postMapper.entityToResponse(postPosted);

        default:
          this.logger.error('Error in adapter');
          this.logger.error(
            'Invalid post type, please select a valid one: ' + post.postType,
          );
          throw error;
      }
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
  ): Promise<void> {
    try {
      return await this.postService.findAllPostByPostType(
        page,
        limit,
        postType,
      );
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
}
