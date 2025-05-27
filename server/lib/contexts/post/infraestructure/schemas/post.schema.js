"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSchema = void 0;
const mongoose_1 = require("mongoose");
exports.PostSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    postType: { type: String, required: true },
    description: { type: String, required: true },
    visibility: { type: String, required: true },
    recomendations: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'PostRecommendation',
        required: true
    },
    price: { type: Number, required: true },
    location: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'PostLocation',
        required: true
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'PostCategory',
        required: true
    },
    comments: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'PostComment',
        required: true
    },
    attachedFiles: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'PostAttachedFile',
        required: true
    },
});
//# sourceMappingURL=post.schema.js.map