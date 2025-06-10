"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//subcription_authorized_payment
class Invoice {
    constructor(paymentId, subscriptionId, status, preapprovalId) {
        this.paymentId = paymentId;
        this.subscriptionId = subscriptionId;
        this.status = status;
        this.preapprovalId = preapprovalId;
        //this.mpAuthorizedPaymentId = mpAuthorizedPaymentId;
    }
    getPaymentId() {
        return this.paymentId;
    }
    getSubscriptionId() {
        return this.subscriptionId;
    }
    getStatus() {
        return this.status;
    }
    getPreapprovalId() {
        return this.preapprovalId;
    }
}
exports.default = Invoice;
//# sourceMappingURL=invoice.entity.js.map