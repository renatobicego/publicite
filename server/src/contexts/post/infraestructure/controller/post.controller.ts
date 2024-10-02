import { Body, Controller, Inject, Post } from '@nestjs/common';
import { PostAdapterInterface } from '../../application/adapter/post.adapter.interface';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PostRequest } from '../../application/adapter/dto/HTTP-REQUEST/post.request';
import { PostResponse } from '../../application/adapter/dto/HTTP-RESPONSE/post.response';
import { PostRequestDto } from './swagger/post.request.swagger';
import { PostResponseDto } from './swagger/post.response.swagger';

@ApiTags('Posts  ')
@Controller('post')
export class PostController {
  constructor(
    @Inject('PostAdapterInterface')
    private readonly postAdapter: PostAdapterInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
    type: [PostResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: PostRequestDto })
  async createPersonalAccount(
    @Body() newPost: PostRequest,
  ): Promise<PostResponse> {
    try {
      return await this.postAdapter.create(newPost);
    } catch (error: any) {
      throw error;
    }
  }
}
