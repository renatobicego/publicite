"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionSchema = void 0;
const mongoose_1 = require("mongoose");
//subscription_preapproval
exports.SubscriptionSchema = new mongoose_1.Schema({
    mpPreapprovalId: { type: String, required: true },
    payerId: { type: String, required: true },
    status: { type: String, required: true },
    subscriptionPlan: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    external_reference: { type: String, required: true },
});
//# sourceMappingURL=subscription.schema.js.map