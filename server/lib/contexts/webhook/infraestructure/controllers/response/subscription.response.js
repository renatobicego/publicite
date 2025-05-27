"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class SubscriptionResponse {
    constructor(mpPreapprovalId, payerId, status, subscriptionPlan, startDate, endDate, external_reference) {
        this.mpPreapprovalId = mpPreapprovalId;
        this.payerId = payerId;
        this.status = status;
        this.subscriptionPlan = subscriptionPlan;
        this.startDate = startDate;
        this.endDate = endDate;
        this.external_reference = external_reference;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The unique identifier for the preapproval',
        type: String,
    })
], SubscriptionResponse.prototype, "mpPreapprovalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The payer ID associated with the subscription',
        type: String,
    })
], SubscriptionResponse.prototype, "payerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The status of the subscription',
        type: String,
    })
], SubscriptionResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the subscription plan',
        type: String,
    })
], SubscriptionResponse.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The start date of the subscription',
        type: String,
        format: 'date-time',
    })
], SubscriptionResponse.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The end date of the subscription',
        type: String,
        format: 'date-time',
    })
], SubscriptionResponse.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The external reference identifier',
        type: String,
    })
], SubscriptionResponse.prototype, "external_reference", void 0);
exports.SubscriptionResponse = SubscriptionResponse;
//# sourceMappingURL=subscription.response.js.map