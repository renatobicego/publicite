import { Types } from "mongoose";


class PostCommentRequest_testing {
    _id: Types.ObjectId;
    user?: Types.ObjectId;
    comment?: string;
    isEdited?: boolean;
    createdAt?: Date;
    response?: Types.ObjectId;;
}



async function insertPostComment(postCommentModel: any, postRequest: PostCommentRequest_testing) {
    const postComment = await postCommentModel.create({
        _id: postRequest._id,
        user: postRequest.user ?? new Types.ObjectId(),
        comment: postRequest.comment ?? "Nuevo comentario",
        isEdited: postRequest.isEdited ?? false,
        createdAt: postRequest.createdAt ?? new Date(),
        response: postRequest.response



    });

    return postComment
}

export { insertPostComment }