"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceSchema = void 0;
const mongoose_1 = require("mongoose");
//subcription_authorized_payment
exports.InvoiceSchema = new mongoose_1.Schema({
    paymentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'payment',
        required: true,
    },
    subscriptionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'subscription',
        required: true,
    },
    status: { type: String, required: true },
    preapprovalId: { type: String, required: true },
});
//# sourceMappingURL=invoice.schema.js.map