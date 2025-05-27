"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostLocation = void 0;
const mongoose_1 = require("mongoose");
exports.PostLocation = new mongoose_1.Schema({
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
});
//# sourceMappingURL=postLocation.schema.js.map