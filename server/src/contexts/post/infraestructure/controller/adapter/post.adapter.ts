import { Inject } from '@nestjs/common';
import { error } from 'console';
import {
  PostGoodRequest,
  PostPetitionRequest,
  PostRequest,
  PostServiceRequest,
} from 'src/contexts/post/application/adapter/dto/HTTP-REQUEST/post.request';
import { PostUpdateRequest } from 'src/contexts/post/application/adapter/dto/HTTP-REQUEST/post.update.request';
import { PostResponse } from 'src/contexts/post/application/adapter/dto/HTTP-RESPONSE/post.response';
import { PostMapperAdapterInterface } from 'src/contexts/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostAdapterInterface } from 'src/contexts/post/application/adapter/post.adapter.interface';
import { PostType } from 'src/contexts/post/domain/entity/enum/post-type.enum';
import { PostServiceInterface } from 'src/contexts/post/domain/service/post.service.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

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
        case PostType.Good.toLocaleLowerCase():
          this.logger.log('We are creating a good post');
          postMapped = this.postMapper.requestToEntity(post as PostGoodRequest);
          postPosted = await this.postService.create(postMapped);
          return this.postMapper.entityToResponse(postPosted);

        case PostType.Service.toLocaleLowerCase():
          this.logger.log('We are creating a service post');
          postMapped = this.postMapper.requestToEntity(
            post as PostServiceRequest,
          );
          postPosted = await this.postService.create(postMapped);
          return this.postMapper.entityToResponse(postPosted);

        case PostType.Petition.toLocaleLowerCase():
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
    cookie?: any,
  ): Promise<any> {
    try {
      this.logger.log('We are updating a post with id: ' + id);
      const { postType } = postUpdate;
      const postMapped = this.postMapper.requestUpdateToEntity(postUpdate);
      this.logger.log('Post mapped succesfully');
      return await this.postService.updatePostById(
        postMapped,
        id,
        postType,
        cookie,
      );
    } catch (error: any) {
      this.logger.log('An error was ocurred updating a post with id: ' + id);
      throw error;
    }
  }
}
