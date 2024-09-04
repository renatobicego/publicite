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
exports.SubscriptionAdapter = void 0;
const common_1 = require("@nestjs/common");
let SubscriptionAdapter = class SubscriptionAdapter {
    constructor(logger, subscriptionService) {
        this.logger = logger;
        this.subscriptionService = subscriptionService;
    }
    async getSubscriptionsByEmail(subID, email) {
        const subscription = await this.subscriptionService.getSubscriptionsByEmail(subID, email);
        return Promise.resolve(subscription);
    }
    async getActiveSubscriptionByEmail(email) {
        const subscription = await this.subscriptionService.getActiveSubscriptionByEmail(email);
        return Promise.resolve(subscription);
    }
};
SubscriptionAdapter = __decorate([
    __param(1, (0, common_1.Inject)('SubscriptionServiceInterface'))
], SubscriptionAdapter);
exports.SubscriptionAdapter = SubscriptionAdapter;
//# sourceMappingURL=mp-subscription.adapter.js.map