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
  // --- Mis Producciones (RNF-06). Límites por CANTIDAD, no por MB. ---
  // Blogs personales que habilita el plan. Es 1 fijo en todos los planes
  // (PLN-01/02): no se acumula entre suscripciones.
  personalBlogsCount: { type: Number },
  // Blogs de grupo que habilita el plan (1 en gratuito, N configurable en pagos).
  // Acumulativo entre suscripciones activas, igual que los posts.
  groupBlogsCount: { type: Number },
  // Cupo de archivos POR BLOG que habilita el plan (~10 en gratuito, sube por plan).
  filesPerBlogCount: { type: Number },
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
  personalBlogsCount?: number;
  groupBlogsCount?: number;
  filesPerBlogCount?: number;
}

const SubscriptionPlanModel = model<SubscriptionPlanDocument>(
  'SubscriptionPlan',
  SubscriptionPlanSchema,
);
export default SubscriptionPlanModel;
