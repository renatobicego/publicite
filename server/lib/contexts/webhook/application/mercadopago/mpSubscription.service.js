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
exports.MpSubscriptionService = void 0;
const common_1 = require("@nestjs/common");
let MpSubscriptionService = class MpSubscriptionService {
    constructor(subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }
    async getActiveSubscriptionByEmail(email) {
        try {
            const subscription = this.subscriptionRepository.getActiveSubscriptionByEmail(email);
            return subscription || null;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error);
        }
    }
    getSubscriptionsByEmail(subID, email) {
        try {
            const subscriptions = this.subscriptionRepository.getSubscriptionByEmail(subID, email);
            return subscriptions;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error);
        }
    }
};
MpSubscriptionService = __decorate([
    __param(0, (0, common_1.Inject)('SubscriptionRepositoryInterface'))
], MpSubscriptionService);
exports.MpSubscriptionService = MpSubscriptionService;
//# sourceMappingURL=mpSubscription.service.js.map