"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRepository = void 0;
const subscription_response_1 = require("../../controllers/response/subscription.response");
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const date_1 = require("@internationalized/date");
let SubscriptionRepository = class SubscriptionRepository {
    constructor(logger, subscriptionModel) {
        this.logger = logger;
        this.subscriptionModel = subscriptionModel;
    }
    async getActiveSubscriptionByEmail(email) {
        // PENDIENTE: TENEMOS QUE VER QUE DIA ES HOY Y CONSULTAR PARA TRAER LAS SUS QUE TENGAN UN END DATE( DEBERIA SER 1 SOLA) MAYOR QUE HOY
        const todayDate = (0, date_1.today)((0, date_1.getLocalTimeZone)()).toString();
        try {
            const subscription = await this.subscriptionModel.findOne({
                external_reference: email,
                endDate: { $gte: todayDate },
            });
            if (!subscription)
                return null;
            const subs = {
                mpPreapprovalId: subscription.mpPreapprovalId,
                payerId: subscription.payerId,
                status: subscription.status,
                subscriptionPlan: subscription.subscriptionPlan,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                external_reference: subscription.external_reference,
            };
            return subs;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error retrieving active subscription');
        }
    }
    async getSubscriptionByEmail(subID, email) {
        this.logger.log('Searching all subscriptions by email: ' + email);
        try {
            const subscriptions = await this.subscriptionModel.find({
                subscriptionPlan: subID,
                external_reference: email,
            });
            if (!subscriptions)
                return [];
            const subs = subscriptions.map((sub) => {
                return new subscription_response_1.SubscriptionResponse(sub.mpPreapprovalId, sub.payerId, sub.status, sub.subscriptionPlan, sub.startDate, sub.endDate, sub.external_reference);
            });
            return subs;
        }
        catch (error) {
            throw error;
        }
    }
};
SubscriptionRepository = __decorate([
    __param(1, (0, mongoose_1.InjectModel)('Subscription'))
], SubscriptionRepository);
exports.SubscriptionRepository = SubscriptionRepository;
//# sourceMappingURL=subscription.repository.js.map