import { ObjectId } from "mongoose";

export class PostRecomendation {
    private user: ObjectId;
    private upVote: Boolean;

    constructor(user: ObjectId, upVote: boolean) {
        this.user = user;
        this.upVote = upVote;
    }
}