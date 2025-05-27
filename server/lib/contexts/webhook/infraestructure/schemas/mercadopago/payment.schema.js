"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.PaymentSchema = new mongoose_1.Schema({
    mpPaymentId: { type: String, required: true },
    payerId: { type: String, required: true },
    payerEmail: { type: String, required: true },
    paymentTypeId: { type: String, required: true },
    paymentMethodId: { type: String, required: true },
    transactionAmount: { type: Number, required: true },
    dateApproved: { type: String, required: true },
});
//# sourceMappingURL=payment.schema.js.map