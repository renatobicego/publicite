"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBusinessModel = void 0;
const mongoose_1 = require("mongoose");
const user_schema_1 = require("./user.schema");
const UserBusinessSchema = new mongoose_1.Schema({
    sector: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Sector', required: true },
    businessName: { type: String, required: true },
});
const UserBusinessModel = user_schema_1.UserModel.discriminator('UserBusiness', UserBusinessSchema);
exports.UserBusinessModel = UserBusinessModel;
//# sourceMappingURL=userBussiness.schema.js.map