import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PostReviewServiceInterface } from "../../domain/service/postReview.service.interface";
import { PostReview as PostReview_interface } from "../adapter/request/post.review.request";
import { Inject } from "@nestjs/common";
import { PostReviewRepositoryInterface } from "../../domain/repository/review.repository.interface";
import { PostReview, } from "../../domain/review.entity";



export class PostReviewService implements PostReviewServiceInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @Inject('PostReviewRepositoryInterface')
        private readonly postReviewService: PostReviewRepositoryInterface,

    ) {

    }
    async createReview(postReview: PostReview_interface): Promise<void> {
        console.log(postReview)
        this.logger.log('creating new review... ');
        try {
            const reviewEntity = new PostReview(postReview.author, postReview.review, postReview.date, postReview.rating, postReview.post_id, postReview.postType);
            return await this.postReviewService.saveReview(reviewEntity)


        } catch (error: any) {
            this.logger.error('An error was ocurred creating new review... ');
            throw error;
        }

    }

} 