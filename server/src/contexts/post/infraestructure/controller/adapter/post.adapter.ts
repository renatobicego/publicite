import { Inject } from '@nestjs/common';
import { PostRequest } from 'src/contexts/post/application/adapter/dto/post.request';
import { PostResponse } from 'src/contexts/post/application/adapter/dto/post.response';
import { PostMapperAdapterInterface } from 'src/contexts/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostAdapterInterface } from 'src/contexts/post/application/adapter/post.adapter.interface';
import { PostServiceInterface } from 'src/contexts/post/domain/service/post.service.interface';

export class PostAdapter implements PostAdapterInterface {
  constructor(
    @Inject('PostServiceInterface')
    private readonly postService: PostServiceInterface,

    @Inject('PostMapperAdapterInterface')
    private readonly postMapper: PostMapperAdapterInterface,
  ) {}
  async create(post: PostRequest): Promise<PostResponse> {
    try {
      const postMapped = this.postMapper.requestToEntity(post);
      const postPosted = await this.postService.create(postMapped);
      return this.postMapper.entityToResponse(postPosted);
    } catch (error: any) {
      throw error;
    }
  }
}
