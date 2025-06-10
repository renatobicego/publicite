/*

El tipo de dato de status es ENUM, por ahjora lo dejo como string
*/

import { model, Schema } from 'mongoose';

export const SubscriptionPlanSchema = new Schema({
  mpPreapprovalPlanId: { type: String, required: true },
  isActive: { type: Boolean, required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: [String], required: true },
  intervalTime: { type: Number, required: true },
  price: { type: Number, required: true },
  isFree: { type: Boolean },
  postsLibresCount: { type: Number },
  postsAgendaCount: { type: Number },
  maxContacts: { type: Number },
  isPack: { type: Boolean },
});

export interface SubscriptionPlanDocument extends Document {
  mpPreapprovalPlanId: string;
  isActive: boolean;
  reason: string;
  description: string;
  features: string[];
  intervalTime: number;
  price: number;
  isFree: boolean;
  postsLibresCount: number;
  postsAgendaCount: number;
  maxContacts: number;
  isPack: boolean;
}

const SubscriptionPlanModel = model<SubscriptionPlanDocument>(
  'SubscriptionPlan',
  SubscriptionPlanSchema,
);
export default SubscriptionPlanModel;
