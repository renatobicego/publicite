import { Inject } from '@nestjs/common';

import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostAdapterInterface } from 'src/contexts/module_post/post/application/adapter/post.adapter.interface';
import {
  PostRequest,
} from 'src/contexts/module_post/post/application/dto/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from 'src/contexts/module_post/post/application/dto/HTTP-REQUEST/post.update.request';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostServiceInterface } from '../../../domain/service/post.service.interface';


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
    searchTerm?: string,
  ): Promise<void> {
    try {
      return await this.postService.findAllPostByPostType(
        page,
        limit,
        postType,
        searchTerm,
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
