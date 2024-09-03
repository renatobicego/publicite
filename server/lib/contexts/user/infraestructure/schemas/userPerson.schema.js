"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPersonModel = void 0;
const mongoose_1 = require("mongoose");
const user_schema_1 = require("./user.schema");
const enums_request_1 = require("../controller/dto/enums.request");
const UserPersonSchema = new mongoose_1.Schema({
    gender: { type: String, enum: Object.values(enums_request_1.Gender), required: true },
    birthDate: { type: String, required: true },
});
const UserPersonModel = user_schema_1.UserModel.discriminator('UserPerson', UserPersonSchema);
exports.UserPersonModel = UserPersonModel;
//# sourceMappingURL=userPerson.schema.js.map