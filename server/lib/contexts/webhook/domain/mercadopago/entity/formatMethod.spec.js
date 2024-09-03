"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const payment_entity_1 = require("src/contexts/webhook/domain/mercadopago/entity/payment.entity");
const subcription_entity_1 = require("src/contexts/webhook/domain/mercadopago/entity/subcription.entity");
describe('Entity Transformation Tests', () => {
    it('should transform PaymentDocument to Payment instance correctly', () => {
        const paymentDoc = {
            _id: new mongoose_1.Types.ObjectId(),
            mpPaymentId: '85924068202',
            payerId: '1948475212',
            payerEmail: 'test_user_1345316664@testuser.com',
            paymentTypeId: 'credit_card',
            paymentMethodId: 'master',
            transactionAmount: 14000,
            dateApproved: '2024-08-22T12:03:16.000-04:00',
        };
        const paymentInstance = payment_entity_1.default.fromDocument(paymentDoc);
        // expect(paymentInstance.getId()).toBe(paymentDoc._id);
        expect(paymentInstance).toBeInstanceOf(payment_entity_1.default);
        expect(paymentInstance.getMPPaymentId()).toBe(paymentDoc.mpPaymentId);
        expect(paymentInstance.getPayerId()).toBe(paymentDoc.payerId);
        expect(paymentInstance.getPayerEmail()).toBe(paymentDoc.payerEmail);
        expect(paymentInstance.getTransactionAmount()).toBe(paymentDoc.transactionAmount);
    });
    it('should transform SubscriptionDocument to Subscription instance correctly', () => {
        const subscriptionDoc = {
            _id: new mongoose_1.Types.ObjectId(),
            mpPreapprovalId: '0304e9241c5c4cdc87e5e834894d954e',
            payerId: '1948475212',
            status: 'authorized',
            subscriptionPlan: new mongoose_1.Types.ObjectId(),
            startDate: '2024-08-22T10:30:10.224-04:00',
            endDate: '2024-09-21T23:00:00.000-04:00',
        };
        const subscriptionInstance = subcription_entity_1.default.fromDocument(subscriptionDoc);
        expect(subscriptionInstance).toBeInstanceOf(subcription_entity_1.default);
        expect(subscriptionInstance.getMpPreapprovalId()).toBe(subscriptionDoc.mpPreapprovalId);
        expect(subscriptionInstance.getPayerId()).toBe(subscriptionDoc.payerId);
        expect(subscriptionInstance.getStatus()).toBe(subscriptionDoc.status);
    });
});
//# sourceMappingURL=formatMethod.spec.js.map