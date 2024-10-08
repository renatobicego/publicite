import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

import { PostCategoryRequest } from '../../application/adapter/dto/HTTP-REQUEST/post.category.request';
import { PostCategoryAdapterInterface } from '../../application/adapter/post.category.adapter.interface';
import { PostCategoryResponse } from '../../application/adapter/dto/HTTP-RESPONSE/post.category.response';

@Resolver()
export class PostCategoryResolver {
  constructor(
    @Inject('PostCategoryAdapterInterface')
    private readonly postCategoryAdapter: PostCategoryAdapterInterface,
  ) {}
  @Mutation(() => PostCategoryResponse, {
    nullable: true,
    description: 'Crear una categoria de un post',
  })
  async createNewCategoryPost(
    @Args('category', { type: () => PostCategoryRequest })
    category: PostCategoryRequest,
  ): Promise<PostCategoryResponse> {
    try {
      return await this.postCategoryAdapter.saveCategory(category);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => [PostCategoryResponse], {
    nullable: true,
    description: 'Devuelve todas las categorias creadas',
  })
  async getAllCategoryPost(): Promise<PostCategoryResponse[]> {
    try {
      return await this.postCategoryAdapter.findAllCategoryPost();
    } catch (error: any) {
      throw error;
    }
  }
}
