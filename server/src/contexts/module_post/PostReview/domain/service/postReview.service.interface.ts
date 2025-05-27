import { PostReview } from "../../application/adapter/request/post.review.request";

export interface PostReviewServiceInterface {
    createReview(postReview: PostReview): Promise<void>;
}