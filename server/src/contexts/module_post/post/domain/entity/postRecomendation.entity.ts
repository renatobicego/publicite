import { ObjectId } from 'mongoose';

export class PostRecomendation {
  private user: ObjectId;
  private upVote: boolean;

  constructor(user: ObjectId, upVote: boolean) {
    this.user = user;
    this.upVote = upVote;
  }
}
