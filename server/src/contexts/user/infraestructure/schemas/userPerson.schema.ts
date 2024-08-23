import { Schema } from "mongoose";
import { IUser, UserModel } from "./user.schema";


enum Gender {
  Mujer = 'Mujer',
  Hombre = 'Hombre',
  Otro = 'Prefiero no decir'
}

interface IUserPerson extends IUser {
  name: string;
  lastName: string;
  gender: Gender;
  birthDate: Date;
}

const UserPersonSchema = new Schema<IUserPerson>({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: Object.values(Gender), required: true },
  birthDate: { type: Date, required: true }
});

const UserPersonModel = UserModel.discriminator<IUserPerson>('UserPerson', UserPersonSchema);

export { UserPersonModel, IUserPerson };
