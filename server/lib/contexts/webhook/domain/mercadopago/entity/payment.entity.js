"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Payment {
    constructor(mpPaymentId, payerId, payerEmail, paymentTypeId, paymentMethodId, transactionAmount, dateApproved, _id) {
        this.mpPaymentId = mpPaymentId;
        this.payerId = payerId;
        this.payerEmail = payerEmail;
        this.paymentTypeId = paymentTypeId;
        this.paymentMethodId = paymentMethodId;
        this.transactionAmount = transactionAmount;
        this.dateApproved = dateApproved;
        this._id = _id;
    }
    getMPPaymentId() {
        return this.mpPaymentId;
    }
    getId() {
        return this._id;
    }
    getPayerId() {
        return this.payerId;
    }
    getPayerEmail() {
        return this.payerEmail;
    }
    getPaymentTypeId() {
        return this.paymentTypeId;
    }
    getPaymentMethodId() {
        return this.paymentMethodId;
    }
    getTransactionAmount() {
        return this.transactionAmount;
    }
    getDateApproved() {
        return this.dateApproved;
    }
    static fromDocument(doc) {
        return new Payment(doc.mpPaymentId, doc.payerId, doc.payerEmail, doc.paymentTypeId, doc.paymentMethodId, doc.transactionAmount, doc.dateApproved, doc._id ? doc._id : ' ');
    }
}
exports.default = Payment;
//# sourceMappingURL=payment.entity.js.map