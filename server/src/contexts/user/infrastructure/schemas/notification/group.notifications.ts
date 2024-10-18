import { Schema } from 'mongoose';

const groupNotification = new Schema(
  {
    group: {
      _id: { type: String },
      name: { type: String },
      profilePhotoUrl: { type: String },
    },
    userInviting: {
      username: { type: String, required: true },
    },
  },
  { _id: false },
);
