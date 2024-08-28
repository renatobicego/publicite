import { Schema } from 'mongoose';
import { IUser, UserModel } from './user.schema';

interface IUserBusiness extends IUser {
  _id?: Schema.Types.ObjectId;
  sector: Schema.Types.ObjectId;
}

const UserBusinessSchema = new Schema<IUserBusiness>({
  _id: { type: Schema.Types.ObjectId, default: '' },
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
});

const UserBusinessModel = UserModel.discriminator<IUserBusiness>(
  'UserBusiness',
  UserBusinessSchema,
);

export { UserBusinessModel, IUserBusiness };
