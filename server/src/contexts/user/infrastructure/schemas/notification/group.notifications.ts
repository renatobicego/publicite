const groupNotification = {
  group: {
    _id: { type: String },
    name: { type: String },
    profilePhotoUrl: { type: String },
  },
  userInviting: {
    username: { type: String, required: true },
  },
};

export { groupNotification };
