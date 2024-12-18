import { Schema, model, Document } from 'mongoose';


import { UserType } from '../../domain/entity/enum/user.enums';

export interface UserPreferences {
  searchPreference: Schema.Types.ObjectId[];
  backgroundColor: number | undefined;
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
  createdTime: string;
  subscriptions: Schema.Types.ObjectId[];
  accountType: Schema.Types.ObjectId;
  groups: Schema.Types.ObjectId[];
  magazines: Schema.Types.ObjectId[];
  board: Schema.Types.ObjectId | undefined;
  posts: Schema.Types.ObjectId[];
  userRelations: Schema.Types.ObjectId[];
  userType: UserType;
  name: string;
  lastName: string;
  finder: string;
  userPreferences: UserPreferences | null | undefined;
  notifications: Schema.Types.ObjectId[];
  friendRequests: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    description: { type: String },
    profilePhotoUrl: { type: String },
    countryRegion: { type: String },
    isActive: { type: Boolean, default: true },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    createdTime: { type: String, default: '' },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: 'Subscription' }],
    accountType: { type: Schema.Types.ObjectId, ref: 'AccountType' },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    magazines: [{ type: Schema.Types.ObjectId, ref: 'Magazine' }],
    board: { type: Schema.Types.ObjectId, ref: 'Board' },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    userRelations: [{ type: Schema.Types.ObjectId, ref: 'UserRelation' }],
    userType: { type: String, enum: Object.values(UserType), required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    finder: { type: String, required: true },
    userPreferences: {
      searchPreference: [{ type: Schema.Types.ObjectId, ref: 'PostCategory' }],
      backgroundColor: { type: Number, default: undefined },
    },
    notifications: [{ type: Schema.Types.ObjectId, ref: 'notification' }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: 'notification' }],
  },
  { discriminatorKey: 'userType', collection: 'users' },
);

//Indices
UserSchema.index({ name: 1 });
UserSchema.index({ finder: 1 });

const UserModel = model<IUser>('User', UserSchema);

export { UserModel, IUser, UserSchema };
