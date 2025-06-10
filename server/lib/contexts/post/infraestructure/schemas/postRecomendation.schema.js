"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRecommendation = void 0;
const mongoose_1 = require("mongoose");
exports.PostRecommendation = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    upVote: { type: Boolean, required: true },
});
//# sourceMappingURL=postRecomendation.schema.js.map