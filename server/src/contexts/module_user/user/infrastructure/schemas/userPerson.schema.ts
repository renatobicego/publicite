import { Schema } from 'mongoose';
import { IUser, UserModel } from './user.schema';
import { Gender } from '../../domain/entity/enum/user.enums';

interface IUserPerson extends IUser {
  gender: Gender;
  birthDate: string;
}

const UserPersonSchema = new Schema<IUserPerson>({
  gender: { type: String, enum: Object.values(Gender), required: true },
  birthDate: { type: String, required: true },
});

const UserPersonModel = UserModel.discriminator<IUserPerson>(
  'Person',
  UserPersonSchema,
);

export { UserPersonModel, IUserPerson };
