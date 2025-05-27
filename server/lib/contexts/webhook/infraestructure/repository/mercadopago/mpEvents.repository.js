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
const mongoose_1 = require("@nestjs/mongoose");
const subcription_entity_1 = require("src/contexts/webhook/domain/mercadopago/entity/subcription.entity");
const payment_entity_1 = require("src/contexts/webhook/domain/mercadopago/entity/payment.entity");
const subscriptionPlan_entity_1 = require("src/contexts/webhook/domain/mercadopago/entity/subscriptionPlan.entity");
let MercadoPagoEventsRepository = class MercadoPagoEventsRepository {
    constructor(logger, subscriptionModel, invoiceModel, paymentModel, subscriptionPlanModel) {
        this.logger = logger;
        this.subscriptionModel = subscriptionModel;
        this.invoiceModel = invoiceModel;
        this.paymentModel = paymentModel;
        this.subscriptionPlanModel = subscriptionPlanModel;
    }
    async findPaymentByPaymentID(id) {
        this.logger.log('Find payment by payment ID: ' + id);
        const payment = await this.paymentModel.findOne({ mpPaymentId: id }).exec();
        return payment ? payment_entity_1.default.fromDocument(payment) : null;
    }
    async findSubscriptionByPreapprovalId(id) {
        this.logger.log('Find subscription by preapproval ID: ' + id);
        const subscription = await this.subscriptionModel.findOne({
            mpPreapprovalId: id,
        }); // mpPreapprovalId es el campo de ID de SUSCRIPCION de MELI
        return subscription ? subcription_entity_1.default.fromDocument(subscription) : null;
    }
    async findAllSubscriptions() {
        this.logger.log('Find all subscriptions');
        const subscriptions = await this.subscriptionModel.find().exec(); // Recupera todos los documentos
        console.log(subscriptions);
        return subscriptions.map((subscription) => subcription_entity_1.default.fromDocument(subscription));
    }
    async findSubscriptionPlanByMeliID(id) {
        this.logger.log('Find subscription plan by Meli ID: ' + id);
        const subscriptionPlanDocument = await this.subscriptionPlanModel
            .findOne({ mpPreapprovalPlanId: id })
            .exec();
        return subscriptionPlanDocument
            ? subscriptionPlan_entity_1.SubscriptionPlan.fromDocument(subscriptionPlanDocument)
            : null;
    }
    async findStatusOfUserSubscription(payerId, subscriptionPlan, external_reference) {
        this.logger.log(`Finding subscription status of  payerId: ${payerId} and subscriptionPlanid: ${subscriptionPlan} and external_reference: ${external_reference}`);
        const userSubscription = await this.subscriptionModel.findOne({
            payerId,
            subscriptionPlan: subscriptionPlan,
            external_reference: external_reference,
        });
        return userSubscription
            ? subcription_entity_1.default.fromDocument(userSubscription)
            : null;
    }
    async createPayment(payment) {
        this.logger.log('Save payment: ' + payment.getMPPaymentId());
        const newPayment = new this.paymentModel(payment);
        await newPayment.save();
    }
    async saveSubPreapproval(sub) {
        this.logger.log('saving new subscription in database SUB_ID: ' + sub.getMpPreapprovalId());
        const newSubscription = new this.subscriptionModel(sub);
        await newSubscription.save();
    }
    async saveInvoice(invoice) {
        this.logger.log('saving new Invoice in database Invoice ID: ' + invoice.getPaymentId());
        const newInvoice = new this.invoiceModel(invoice);
        await newInvoice.save();
        this.logger.log('the invoice payment ID: ' +
            newInvoice.paymentId +
            ' has been related to subscription ID: ' +
            newInvoice.subscriptionId);
    }
    async updateUserSubscription(payerId, sub) {
        this.logger.log('Update subscription of payerID: ' + payerId);
        const subcriptionPlanId = sub.getSubscriptionPlan();
        const updateFields = Object.assign({}, sub);
        // Realiza la actualización
        await this.subscriptionModel.findOneAndUpdate({ payerId: payerId }, { subscriptionPlan: subcriptionPlanId }, { $set: updateFields });
    }
};
MercadoPagoEventsRepository = __decorate([
    __param(1, (0, mongoose_1.InjectModel)('Subscription')),
    __param(2, (0, mongoose_1.InjectModel)('Invoice')),
    __param(3, (0, mongoose_1.InjectModel)('Payment')),
    __param(4, (0, mongoose_1.InjectModel)('SubscriptionPlan'))
], MercadoPagoEventsRepository);
exports.default = MercadoPagoEventsRepository;
//# sourceMappingURL=mpEvents.repository.js.map