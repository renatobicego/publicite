import { Schema, model, Document } from 'mongoose';
import { UserRelationType } from '../../domain/entity/enum/user.relation.enum';



interface UserRelationDocument extends Document {
    userA: Schema.Types.ObjectId;
    userB: Schema.Types.ObjectId;
    typeRelationA: string;
    typeRelationB: string;
}

const UserRelationSchema = new Schema<UserRelationDocument>({
    userA: { type: Schema.Types.ObjectId, ref: 'User' },
    userB: { type: Schema.Types.ObjectId, ref: 'User' },
    typeRelationA: { type: String, enum: Object.values(UserRelationType), required: true },
    typeRelationB: { type: String, enum: Object.values(UserRelationType), required: true },
});

const UserRelationModel = model<UserRelationDocument>('UserRelation', UserRelationSchema);

export { UserRelationModel, UserRelationDocument };