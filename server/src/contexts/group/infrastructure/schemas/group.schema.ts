import { Schema } from 'mongoose';
import { Visibility } from '../../domain/entity/enum/group.visibility.enum';

export const GroupSchema = new Schema({
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String },
  alias: { type: String, required: true, unique: true },
  rules: { type: String },
  magazines: [{ type: Schema.Types.ObjectId, ref: 'Magazine' }],
  details: { type: String },
  profilePhotoUrl: { type: String },
  visibility: {
    type: String,
    enum: Object.values(Visibility),
    default: 'public',
  },
  groupNotificationsRequest: {
    pendingNotifications: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pendingInvitations: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
});

export interface GroupDocument extends Document {
  members: string[];
  admins: string[];
  name: string;
  alias: string;
  creator: string;
  rules: string;
  magazines: string[];
  details: string;
  profilePhotoUrl: string;
  visibility: Visibility;
  groupNotificationsRequest: {
    pendingNotifications: string[];
    pendingInvitations: string[];
  };
}

// Middleware para eliminar secciones asociadas antes de eliminar las revistas
GroupSchema.pre(
  'findOneAndDelete',
  { document: false, query: true },
  async function (next) {
    try {
      const group = await this.model.findOne(this.getFilter());

      if (!group || group === null) {
        return null;
      }
      const peopleToDelete: any[] = [];

      console.log('group found, remove group in user');
      group.members.forEach((member: string) => peopleToDelete.push(member));
      group.admins.forEach((admin: string) => peopleToDelete.push(admin));

      await group
        .model('User')
        .updateMany(
          { _id: { $in: peopleToDelete } },
          { $pull: { groups: group._id } },
          { multi: true },
        );

      next();
    } catch (error) {
      throw error;
    }
  },
);

GroupSchema.index({ name: 1 });
GroupSchema.index({ admins: 1 });
GroupSchema.index({ members: 1 });
GroupSchema.index({ groupNotificationsRequest: 1 });
