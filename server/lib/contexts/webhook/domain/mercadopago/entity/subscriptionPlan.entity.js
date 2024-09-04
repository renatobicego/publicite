"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlan = void 0;
class SubscriptionPlan {
    constructor(mpPreapprovalPlanId, isActive, reason, description, features, intervalTime, price, postLimit, _id) {
        this._id = _id;
        this.mpPreapprovalPlanId = mpPreapprovalPlanId;
        this.isActive = isActive;
        this.reason = reason;
        this.description = description;
        this.features = features;
        this.intervalTime = intervalTime;
        this.price = price;
        this.postLimit = postLimit;
    }
    getId() {
        return this._id;
    }
    getMpPreapprovalPlanId() {
        return this.mpPreapprovalPlanId;
    }
    getDescription() {
        return this.description;
    }
    static fromDocument(doc) {
        return new SubscriptionPlan(doc.mpPreapprovalPlanId, doc.isActive, doc.reason, doc.description, doc.features, doc.intervalTime, doc.price, doc.postLimit, doc._id ? doc._id : '');
    }
}
exports.SubscriptionPlan = SubscriptionPlan;
//# sourceMappingURL=subscriptionPlan.entity.js.map