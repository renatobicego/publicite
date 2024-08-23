import { Schema, model, Document } from "mongoose";

enum UserType {
  Admin = 'Admin',
  Regular = 'Regular'
}

interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  description: string;
  profilePhotoUrl: string;
  countryRegion: string;
  isActive: boolean;
  contact: Schema.Types.ObjectId;
  createdTime: Date;
  subscriptions: Schema.Types.ObjectId[];
  accountType: Schema.Types.ObjectId;
  groups: Schema.Types.ObjectId[];
  magazines: Schema.Types.ObjectId[];
  board: Schema.Types.ObjectId[];
  post: Schema.Types.ObjectId[];
  userRelations: Schema.Types.ObjectId[];
  userType: UserType;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  description: { type: String },
  profilePhotoUrl: { type: String },
  countryRegion: { type: String },
  isActive: { type: Boolean, default: true },
  contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
  createdTime: { type: Date, default: Date.now },
  subscriptions: [{ type: Schema.Types.ObjectId, ref: 'Subscription' }],
  accountType: { type: Schema.Types.ObjectId, ref: 'AccountType' },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  magazines: [{ type: Schema.Types.ObjectId, ref: 'Magazine' }],
  board: [{ type: Schema.Types.ObjectId, ref: 'Board' }],
  post: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  userRelations: [{ type: Schema.Types.ObjectId, ref: 'UserRelation' }],
  userType: { type: String, enum: Object.values(UserType), required: true }
}, { discriminatorKey: 'kind', collection: 'users' });

const UserModel = model<IUser>('User', UserSchema);

export { UserModel, IUser };
