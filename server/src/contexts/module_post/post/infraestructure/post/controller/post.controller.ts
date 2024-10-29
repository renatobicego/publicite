import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { PostRequestDto } from './swagger/post.request.swagger';
import { PostResponseDto } from './swagger/post.response.swagger';
import { PostAdapterInterface } from 'src/contexts/module_post/post/application/post/adapter/post.adapter.interface';
import { PostRequest } from 'src/contexts/module_post/post/application/post/dto/HTTP-REQUEST/post.request';
import { PostResponse } from 'src/contexts/module_post/post/application/post/dto/HTTP-RESPONSE/post.response';

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
