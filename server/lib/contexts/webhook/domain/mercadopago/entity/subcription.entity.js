"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//subscription_preapproval
class Subscription {
    constructor(mpPreapprovalId, payerId, status, subscriptionPlan, startDate, endDate, external_reference, _id) {
        this.mpPreapprovalId = mpPreapprovalId;
        this.payerId = payerId;
        this.status = status;
        this.subscriptionPlan = subscriptionPlan;
        this.startDate = startDate;
        this.endDate = endDate;
        this.external_reference = external_reference;
        this._id = _id;
    }
    getMpPreapprovalId() {
        return this.mpPreapprovalId;
    }
    getPayerId() {
        return this.payerId;
    }
    getId() {
        return this._id || undefined;
    }
    getStatus() {
        return this.status;
    }
    getSubscriptionPlan() {
        return this.subscriptionPlan;
    }
    getStartDate() {
        return this.startDate;
    }
    getEndDate() {
        return this.endDate;
    }
    static fromDocument(doc) {
        console.log('convirtiendo sub schema a entity');
        return new Subscription(doc.mpPreapprovalId, doc.payerId, doc.status, doc.subscriptionPlan, doc.startDate, doc.endDate, doc.external_reference, doc._id ? doc._id : ' ');
    }
}
exports.default = Subscription;
//# sourceMappingURL=subcription.entity.js.map