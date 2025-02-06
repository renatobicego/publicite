import { Min, Max } from 'class-validator';

export class PostReview {
    private author: string;
    private review: string;
    private date: Date;

    @Min(0)
    @Max(5)
    private rating: number;
    private postId: any
    private postType: string

    constructor(author: string, review: string, date: Date, rating: number, postId: any, postType: string) {
        this.author = author;
        this.review = review;
        this.date = date;
        this.rating = rating;
        this.postId = postId
        this.postType = postType;
    }

    get getPostId() {
        return this.postId;
    }

    get getPostType() {
        return this.postType;
    }
}