import { Schema } from "mongoose";
import { UserModel, IUser } from "./user.entity";

interface IUserBusiness extends IUser {
  sector: Schema.Types.ObjectId;
}

const UserBusinessSchema = new Schema<IUserBusiness>({
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true }
});

const UserBusinessModel = UserModel.discriminator<IUserBusiness>('UserBusiness', UserBusinessSchema);

export { UserBusinessModel, IUserBusiness };
