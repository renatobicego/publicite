import { Schema } from 'mongoose';
import { IUser, UserModel } from './user.schema';

interface IUserBusiness extends IUser {
  // sector: Schema.Types.ObjectId;
  sector: string;
}

const UserBusinessSchema = new Schema<IUserBusiness>({
  // sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  sector: { type: String, required: true },
});

const UserBusinessModel = UserModel.discriminator<IUserBusiness>(
  'UserBusiness',
  UserBusinessSchema,
);

export { UserBusinessModel, IUserBusiness };
