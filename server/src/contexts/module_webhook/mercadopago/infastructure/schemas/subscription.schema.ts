import mongoose, { model, Schema, Types } from 'mongoose';

import {
  SUBSCRIPTION_KINDS,
  SubscriptionKind,
} from 'src/contexts/module_shared/subscriptions/subscription.kind';

//subscription_preapproval

export const SubscriptionSchema = new Schema({
  // En las que no son de MP (temporal de cambio de plan, regalo) es un id propio
  // con prefijo (`carryover:<id>`, `gift:<id>`) para no chocar con el índice único.
  mpPreapprovalId: { type: String, required: true },
  payerId: { type: String, required: true },
  status: { type: String, required: true },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  // Valor crudo de MP: mongoId del usuario o una referencia con prefijo
  // (`gift:`, `friendGroup:`). Quién paga va en `payerUser` y quiénes son
  // titulares sale de `User.subscriptions`.
  external_reference: { type: String, required: true },
  timeOfUpdate: { type: String },
  nextPaymentDate: { type: String },
  paymentMethodId: { type: String },
  cardId: { type: String },
  kind: {
    type: String,
    enum: SUBSCRIPTION_KINDS,
    default: SubscriptionKind.MP,
  },
  // Sólo en las temporales (extra de cambio de plan, regalo). Ver activeSubscriptionMatch.
  expiresAt: { type: Date },
  // Quién paga. En las anteriores al campo es el `external_reference`.
  payerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export interface SubscriptionDocument extends Document {
  mpPreapprovalId: string;
  payerId: string;
  status: string;
  subscriptionPlan: Types.ObjectId;
  startDate: string;
  endDate: string;
  external_reference: string;
  timeOfUpdate: string;
  nextPaymentDate: string;
  paymentMethodId: string;
  cardId: string;
  kind?: SubscriptionKind;
  expiresAt?: Date;
  payerUser?: Types.ObjectId;
}


SubscriptionSchema.index({ mpPreapprovalId: 1 }, { unique: true });
SubscriptionSchema.index({ payerUser: 1 }, { sparse: true });



const SubscriptionModel = model<SubscriptionDocument>('Subscription', SubscriptionSchema);
export default SubscriptionModel
