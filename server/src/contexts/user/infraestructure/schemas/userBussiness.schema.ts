import { Schema } from 'mongoose';
import { IUser, UserModel } from './user.schema';

interface IUserBusiness extends IUser {
  sector: Schema.Types.ObjectId;
  businessName: string;
}

const UserBusinessSchema = new Schema<IUserBusiness>({
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  businessName: { type: String, required: true },
});

const UserBusinessModel = UserModel.discriminator<IUserBusiness>(
  'Business',
  UserBusinessSchema,
);

export { UserBusinessModel, IUserBusiness };
