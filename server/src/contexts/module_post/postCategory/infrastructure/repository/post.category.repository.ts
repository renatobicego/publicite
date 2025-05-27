import { InjectModel } from '@nestjs/mongoose';
import { PostCategory } from '../../domain/entity/post.category.entity';
import { Model } from 'mongoose';

import { PostCategoryRepositoryInterface } from '../../domain/repository/post.category.repository.interface';
import { PostCategoryDocument } from '../schemas/post.cateogory.schema';
import { PostCategoryResponse } from '../../application/adapter/dto/HTTP-RESPONSE/post.category.response';

export class PostCategoryRepository implements PostCategoryRepositoryInterface {
  constructor(
    @InjectModel('PostCategory')
    private readonly postCategoryModel: Model<PostCategoryDocument>,
  ) {}
  async findAllCategoryPost(): Promise<PostCategoryResponse[]> {
    try {
      const categories = await this.postCategoryModel
        .find()
        .sort({ label: 1 })
        .lean();
      return categories.map((category) => new PostCategoryResponse(category));
    } catch (error: any) {
      throw error;
    }
  }

  async saveCategory(category: PostCategory): Promise<PostCategoryResponse> {
    try {
      const newCategory = new this.postCategoryModel(category);
      const categorySaved = await newCategory.save();
      return new PostCategoryResponse(categorySaved);
    } catch (error: any) {
      throw error;
    }
  }
}
