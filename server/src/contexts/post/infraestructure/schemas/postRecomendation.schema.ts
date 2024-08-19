import mongoose, { ObjectId, Schema, Types } from "mongoose";

export const PostRecommendation = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
    upVote: { type: Boolean, required: true },

})


export interface PostRecommendationDocument extends Document {
	user: ObjectId;
	upVote: Types.ObjectId;
	
}