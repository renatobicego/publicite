"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ContactSchema = new mongoose_1.Schema({
    phone: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    x: { type: String },
    website: { type: String },
});
//# sourceMappingURL=contact.schema.js.map