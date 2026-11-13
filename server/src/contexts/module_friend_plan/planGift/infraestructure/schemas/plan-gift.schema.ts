import mongoose, { Schema } from 'mongoose';

import { PlanGiftStatus } from '../../domain/entity/plan-gift.types';

/*
Regalos de planes (colección `plangifts`). Ver plan-gift.types.ts.
El destinatario es una cuenta (`recipient`) o, si todavía no tiene cuenta, un
email (`recipientEmail`): cuando alguien se registra con ese email, el regalo se
le asigna.
*/
export const PlanGiftSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    giver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    recipientEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    mpPreapprovalPlanId: { type: String, required: true },
    planReason: { type: String, required: true },
    months: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PlanGiftStatus),
      default: PlanGiftStatus.pendingPayment,
      index: true,
    },
    mpPaymentId: { type: String, default: null },
    paymentStatus: { type: String, default: null },
    paymentStatusDetail: { type: String, default: null },
    activatedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
  },
  { timestamps: true, collection: 'plangifts' },
);
