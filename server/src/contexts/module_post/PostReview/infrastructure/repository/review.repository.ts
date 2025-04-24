import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { PostReviewRepositoryInterface } from '../../domain/repository/review.repository.interface';
import { Connection, Model } from 'mongoose';
import { PostReviewDocument } from '../schemas/review.schema';
import { PostReview } from '../../domain/review.entity';
import {
  PostGoodModel,
  IPostGood,
} from 'src/contexts/module_post/post/infraestructure/schemas/post-types-schemas/post.good.schema';
import {
  PostServiceModel,
  IPostService,
} from 'src/contexts/module_post/post/infraestructure/schemas/post-types-schemas/post.service.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class PostReviewRepository implements PostReviewRepositoryInterface {
  constructor(
    @InjectModel('PostReview')
    private readonly reviewModel: Model<PostReviewDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(PostGoodModel.modelName)
    private readonly postGoodDocument: Model<IPostGood>,

    @InjectModel(PostServiceModel.modelName)
    private readonly postServiceDocument: Model<IPostService>,
    private readonly logger: MyLoggerService,
  ) {}

  async saveReview(review: PostReview): Promise<boolean> {
    const session = await this.connection.startSession();
    this.logger.log('Saving review and pushing it to post in repository...');

    try {
      const reviewDocument = new this.reviewModel(review);

      const result = await session.withTransaction(async (session) => {
        const reviewSaved = await reviewDocument.save({ session });

        if (!reviewSaved?._id) {
          this.logger.error('Error occurred while saving review.');
          return false;
        }

        this.logger.log('Review saved successfully...');

        const postType = review.getPostType;
        const postId = review.getPostId;
        const postModel =
          postType === 'good'
            ? this.postGoodDocument
            : postType === 'service'
              ? this.postServiceDocument
              : null;
        if (!postModel) {
          this.logger.error(
            'Invalid post type. Please check the create review repository.',
          );
          throw new Error('Invalid post type.');
        }

        this.logger.log(`Pushing review to ${postType} post...`);

        const updateResult = await (
          postModel as Model<IPostGood | IPostService>
        )
          .updateOne(
            { _id: postId },
            { $addToSet: { reviews: reviewSaved._id } },
          )
          .session(session);

        return updateResult.modifiedCount > 0;
      });

      return result;
    } catch (error) {
      this.logger.error('Error in saveReview:', error);
      throw error;
    }
  }
}
