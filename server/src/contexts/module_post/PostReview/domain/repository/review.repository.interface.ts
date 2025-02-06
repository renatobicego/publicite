import { PostReview } from "../review.entity";

export interface PostReviewRepositoryInterface {
  saveReview(review: PostReview): Promise<any>;
}
