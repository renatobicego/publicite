"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
var UserType;
(function (UserType) {
    UserType["Personal"] = "Personal";
    UserType["Business"] = "Business";
})(UserType || (UserType = {}));
const UserSchema = new mongoose_1.Schema({
    clerkId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    description: { type: String },
    profilePhotoUrl: { type: String },
    countryRegion: { type: String },
    isActive: { type: Boolean, default: true },
    contact: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Contact' },
    createdTime: { type: String, default: '' },
    subscriptions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription' }],
    accountType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AccountType' },
    groups: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Group' }],
    magazines: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Magazine' }],
    board: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Board' }],
    post: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Post' }],
    userRelations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'UserRelation' }],
    userType: { type: String, enum: Object.values(UserType), required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
}, { discriminatorKey: 'kind', collection: 'users' });
const UserModel = (0, mongoose_1.model)('User', UserSchema);
exports.UserModel = UserModel;
//# sourceMappingURL=user.schema.js.map