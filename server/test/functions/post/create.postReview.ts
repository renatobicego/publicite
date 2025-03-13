import { Types } from "mongoose";


class PostReviewRequest_testing {
    _id: Types.ObjectId;
    author?: Types.ObjectId;
    review?: string;
    date?: Date;
    rating?: number;
}



async function insertPostReview(postReviewModel: any, postRequest: PostReviewRequest_testing) {
    const postReview = await postReviewModel.create({
        _id: postRequest._id,
        author: postRequest.author ?? "author",
        review: postRequest.review ?? "review",
        date: postRequest.date ?? new Date(),
        rating: postRequest.rating ?? 5
    });

    return postReview
}


export { insertPostReview }