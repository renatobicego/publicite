import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { PostReviewRepositoryInterface } from "../../domain/repository/review.repository.interface";
import { Connection, Model } from "mongoose";
import { IPostReviewDocument } from "../schemas/review.schema";
import { PostReview } from "../../domain/review.entity";
import { PostGoodModel, IPostGood } from "src/contexts/module_post/post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { PostServiceModel, IPostService } from "src/contexts/module_post/post/infraestructure/schemas/post-types-schemas/post.service.schema";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";


export class PostReviewRepository implements PostReviewRepositoryInterface {
  constructor(
    @InjectModel("PostReview")
    private readonly reviewModel: Model<IPostReviewDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(PostGoodModel.modelName)
    private readonly postGoodDocument: Model<IPostGood>,

    @InjectModel(PostServiceModel.modelName)
    private readonly postServiceDocument: Model<IPostService>,
    private readonly logger: MyLoggerService,

  ) { }

  async saveReview(review: PostReview): Promise<any> {
    const session = await this.connection.startSession();
    this.logger.log("Saving review and push it to post in repoository...");
    try {

      const reviewDocument = new this.reviewModel(review)
      await session.withTransaction(async (session) => {
        const reviewSaved = await reviewDocument.save({ session });

        if (reviewSaved && reviewSaved._id) {
          this.logger.log("Review saved successfully...");
          if (review.getPostType == 'good') {
            this.logger.log("Push review to good post...");
            await this.postGoodDocument.updateOne({ _id: review.getPostId }, { $addToSet: { reviews: reviewSaved._id } }).session(session)

          } else if (review.getPostType == 'service') {
            this.logger.log("Push review to service post...");
            await this.postServiceDocument.updateOne({ _id: review.getPostId }, { $addToSet: { reviews: reviewSaved._id } }).session(session)

          } else {
            this.logger.error("Post type not valid, plase check create review repository");
            throw new Error('Post type not valid, plase check create review repository');
          }

          return true
        } else {
          this.logger.log("Error was occured saving review and push it to post in repoository...");
          return false
        }
      });
    } catch (error: any) {
      throw error;
    }
    finally {
      session.endSession();
    }
  }
}
