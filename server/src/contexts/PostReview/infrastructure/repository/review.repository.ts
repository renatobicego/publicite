import { InjectModel } from '@nestjs/mongoose';
import { ReviewRepositoryInterface } from '../../domain/repository/review.repository.interface';
import { Model } from 'mongoose';
import { error } from 'console';

export class ReviewRepository implements ReviewRepositoryInterface {
  // constructor(
  //   @InjectModel
  //   private readonly reviewModel: Model<,
  // ) {}

  saveReview(review: any): Promise<any> {
    try {
      throw error;
    } catch (error: any) {
      throw error;
    }
  }
}
