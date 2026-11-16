import mongoose, { Schema } from 'mongoose';

import {
  FriendGroupMemberStatus,
  FriendGroupStatus,
} from '../../domain/entity/friend-group.types';

/*
Grupos de Hacete Amigo (colección `friendgroups`). Ver friend-group.types.ts.
El precio se congela al pagar (memberCount, discountPercent, planAmount,
pricePerMember, totalAmount) y desde ahí el grupo no cambia.
*/
const FriendGroupMemberSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(FriendGroupMemberStatus),
      required: true,
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    invitedAt: { type: Date, default: null },
    joinedAt: { type: Date, default: null },
  },
  { _id: false },
);

export const FriendGroupSchema = new Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    mpPreapprovalPlanId: { type: String, required: true },
    planReason: { type: String, required: true },
    members: { type: [FriendGroupMemberSchema], default: [] },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inviteCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(FriendGroupStatus),
      default: FriendGroupStatus.forming,
      index: true,
    },
    memberCount: { type: Number, default: null },
    discountPercent: { type: Number, default: null },
    planAmount: { type: Number, default: null },
    pricePerMember: { type: Number, default: null },
    totalAmount: { type: Number, default: null },
    mpPreapprovalId: { type: String, default: null, index: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    cancelReason: { type: String, default: null },
    activatedAt: { type: Date, default: null },
    paymentFailedAt: { type: Date, default: null },
    // Anuncios que apagó el downgrade del cobro rechazado, por miembro.
    pausedPosts: {
      type: [
        {
          _id: false,
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
        },
      ],
      default: [],
    },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'friendgroups' },
);

FriendGroupSchema.index({ 'members.user': 1, status: 1 });
