"use strict";
/*

El tipo de dato de status es ENUM, por ahjora lo dejo como string
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlanSchema = void 0;
const mongoose_1 = require("mongoose");
exports.SubscriptionPlanSchema = new mongoose_1.Schema({
    mpPreapprovalPlanId: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    features: { type: [String], required: true },
    intervalTime: { type: Number, required: true },
    price: { type: Number, required: true },
    postLimit: { type: Number, required: true },
    _id: { type: mongoose_1.Types.ObjectId, default: mongoose_1.Types.ObjectId },
});
//# sourceMappingURL=subscriptionPlan.schema.js.map