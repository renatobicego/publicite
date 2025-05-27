import { PostReview } from "./request/post.review.request";


export interface PostReviewAdapterInterface {
    createReview(postReview: PostReview): Promise<void>;
}