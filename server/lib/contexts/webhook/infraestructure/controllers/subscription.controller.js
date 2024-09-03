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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_response_1 = require("./response/subscription.response");
const swagger_1 = require("@nestjs/swagger");
let SubscriptionController = class SubscriptionController {
    constructor(logger, subscriptionAdapter) {
        this.logger = logger;
        this.subscriptionAdapter = subscriptionAdapter;
    }
    /*
    CONSULTAR SI DEVUELVO ARRAY VACIO O 404
    */
    async getAllSubscriptionsController(subscriptionId, userId) {
        try {
            this.logger.log(`Searching subscriptions by subscriptionId: ${subscriptionId}, UserId: ${userId}`);
            const subscription = await this.subscriptionAdapter.getSubscriptionsByEmail(subscriptionId, userId);
            return subscription;
        }
        catch (error) {
            throw error;
        }
    }
    async getActiveSubscriptionController(email) {
        try {
            this.logger.log(`Searching active subscription by UserId: ${email}`);
            const subscription = await this.subscriptionAdapter.getActiveSubscriptionByEmail(email);
            return subscription;
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Get)(':subscriptionId/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subscription by userId' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all subscriptions of user.',
        type: [subscription_response_1.SubscriptionResponse],
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'There are no subscriptions with that subscription ID.',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'subscriptionId', description: 'The subscription ID' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'The user ID' }),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Param)('userId'))
], SubscriptionController.prototype, "getAllSubscriptionsController", null);
__decorate([
    (0, common_1.Get)(':email'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active subscription by userId' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return active subscription of user.',
        type: [subscription_response_1.SubscriptionResponse],
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'email', description: 'The user email' }),
    __param(0, (0, common_1.Param)('email'))
], SubscriptionController.prototype, "getActiveSubscriptionController", null);
SubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)('mercadopago/subscription'),
    __param(1, (0, common_1.Inject)('SubscriptionAdapterInterface'))
], SubscriptionController);
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map