import { Inject } from '@nestjs/common';
import { PostCategoryRequest } from '../../../application/adapter/dto/HTTP-REQUEST/post.category.request';
import { PostCategoryAdapterInterface } from '../../../application/adapter/post.category.adapter.interface';
import { PostCategoryServiceInterface } from '../../../domain/service/post.category.service.interface';
import { PostCategoryResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/post.category.response';

export class PostCategoryAdapter implements PostCategoryAdapterInterface {
  constructor(
    @Inject('PostCategoryServiceInterface')
    private readonly postCategoryService: PostCategoryServiceInterface,
  ) {}
  async findAllCategoryPost(): Promise<PostCategoryResponse[]> {
    try {
      return await this.postCategoryService.findAllCategoryPost();
    } catch (error: any) {
      throw error;
    }
  }
  async saveCategory(
    category: PostCategoryRequest,
  ): Promise<PostCategoryResponse> {
    try {
      return await this.postCategoryService.saveCategory(category);
    } catch (error: any) {
      throw error;
    }
  }
}
