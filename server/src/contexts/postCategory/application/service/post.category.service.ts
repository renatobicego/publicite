import { Inject } from '@nestjs/common';
import { PostCategoryRepositoryInterface } from '../../domain/repository/post.category.repository.interface';
import { PostCategoryServiceInterface } from '../../domain/service/post.category.service.interface';
import { PostCategoryRequest } from '../adapter/dto/HTTP-REQUEST/post.category.request';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { PostCategory } from '../../domain/entity/post.category.entity';
import { PostCategoryResponse } from '../adapter/dto/HTTP-RESPONSE/post.category.response';

export class PostCategoryService implements PostCategoryServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('PostCategoryRepositoryInterface')
    private readonly postCategoryRepository: PostCategoryRepositoryInterface,
  ) {}
  async findAllCategoryPost(): Promise<PostCategoryResponse[]> {
    try {
      this.logger.log(`Find All Category Post`);
      return await this.postCategoryRepository.findAllCategoryPost();
    } catch (error: any) {
      this.logger.error('Error Find All post category', error);
      throw error;
    }
  }

  async saveCategory(
    category: PostCategoryRequest,
  ): Promise<PostCategoryResponse> {
    try {
      this.logger.log(`saveCategory: ${category.label}`);
      const categoryEntity = new PostCategory(category.label);
      return await this.postCategoryRepository.saveCategory(categoryEntity);
    } catch (error: any) {
      this.logger.error('Error while saving post category', error);
      throw error;
    }
  }
}
