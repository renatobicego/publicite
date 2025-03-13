import { Types } from "mongoose";


class PostReaction_testing {
    _id: Types.ObjectId;
    user?: Types.ObjectId;
    reaction?: string;

}



async function insertPostReaction(postReactionModel: any, postRequest: PostReaction_testing) {
    const postReaction = await postReactionModel.create({
        _id: postRequest._id,
        user: postRequest.user ?? new Types.ObjectId(),
        reaction: postRequest.reaction ?? "😊",
    });

    return postReaction
}

export { insertPostReaction }