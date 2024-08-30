import { Types } from 'mongoose';
import { PaymentDocument } from '../../../infraestructure/schemas/mercadopago/payment.schema';
import { SubscriptionDocument } from '../../../infraestructure/schemas/mercadopago/subscription.schema';
import Payment from 'src/contexts/webhook/domain/mercadopago/entity/payment.entity';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';

describe('Entity Transformation Tests', () => {
  it('should transform PaymentDocument to Payment instance correctly', () => {
    const paymentDoc: PaymentDocument = {
      _id: new Types.ObjectId(),
      mpPaymentId: '85924068202',
      payerId: '1948475212',
      payerEmail: 'test_user_1345316664@testuser.com',
      paymentTypeId: 'credit_card',
      paymentMethodId: 'master',
      transactionAmount: 14000,
      dateApproved: '2024-08-22T12:03:16.000-04:00',
    } as any;

    const paymentInstance = Payment.fromDocument(paymentDoc);

    // expect(paymentInstance.getId()).toBe(paymentDoc._id);
    expect(paymentInstance).toBeInstanceOf(Payment);
    expect(paymentInstance.getMPPaymentId()).toBe(paymentDoc.mpPaymentId);
    expect(paymentInstance.getPayerId()).toBe(paymentDoc.payerId);
    expect(paymentInstance.getPayerEmail()).toBe(paymentDoc.payerEmail);
    expect(paymentInstance.getTransactionAmount()).toBe(
      paymentDoc.transactionAmount,
    );
  });

  it('should transform SubscriptionDocument to Subscription instance correctly', () => {
    const subscriptionDoc: SubscriptionDocument = {
      _id: new Types.ObjectId(),
      mpPreapprovalId: '0304e9241c5c4cdc87e5e834894d954e',
      payerId: '1948475212',
      status: 'authorized',
      subscriptionPlan: new Types.ObjectId(),
      startDate: '2024-08-22T10:30:10.224-04:00',
      endDate: '2024-09-21T23:00:00.000-04:00',
    } as any;

    const subscriptionInstance = Subscription.fromDocument(subscriptionDoc);

    expect(subscriptionInstance).toBeInstanceOf(Subscription);
    expect(subscriptionInstance.getMpPreapprovalId()).toBe(
      subscriptionDoc.mpPreapprovalId,
    );
    expect(subscriptionInstance.getPayerId()).toBe(subscriptionDoc.payerId);
    expect(subscriptionInstance.getStatus()).toBe(subscriptionDoc.status);
  });
});
