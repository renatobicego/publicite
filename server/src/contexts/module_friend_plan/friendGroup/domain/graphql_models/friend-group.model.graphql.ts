import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FriendPlanTier {
  @Field(() => Int)
  members: number;
  @Field(() => Float)
  discountPercent: number;
  @Field(() => Float, { description: 'Lo que paga cada uno por mes' })
  pricePerMember: number;
  @Field(() => Float, { description: 'Lo que se debita por mes (todos)' })
  totalAmount: number;
}

@ObjectType()
export class FriendPlanOption {
  @Field(() => String)
  mpPreapprovalPlanId: string;
  @Field(() => String)
  planReason: string;
  @Field(() => Float, { description: 'Precio mensual del plan individual (MP)' })
  planAmount: number;
  @Field(() => [FriendPlanTier], { description: 'Precio según la cantidad de miembros' })
  tiers: FriendPlanTier[];
}

@ObjectType()
export class FriendPlanOptionsResponse {
  @Field(() => [FriendPlanOption])
  plans: FriendPlanOption[];
  @Field(() => Int)
  minMembers: number;
  @Field(() => Int, { description: '0 = sin tope' })
  maxMembers: number;
}

@ObjectType()
export class FriendGroupMemberModel {
  @Field(() => ID)
  userId: string;
  @Field(() => String, { nullable: true })
  name: string | null;
  @Field(() => String, { nullable: true })
  username: string | null;
  @Field(() => String, { nullable: true })
  profilePhotoUrl: string | null;
  @Field(() => String, { description: 'invited | accepted' })
  status: string;
  @Field(() => Boolean, { description: 'Publicó al menos un anuncio o una producción' })
  isActivated: boolean;
  @Field(() => Boolean)
  isCreator: boolean;
  @Field(() => Boolean)
  isPayer: boolean;
}

@ObjectType()
export class FriendGroupPricingModel {
  @Field(() => Int)
  memberCount: number;
  @Field(() => Float)
  discountPercent: number;
  @Field(() => Float)
  planAmount: number;
  @Field(() => Float)
  pricePerMember: number;
  @Field(() => Float)
  totalAmount: number;
}

@ObjectType()
export class FriendGroupModel {
  @Field(() => ID)
  _id: string;
  @Field(() => String, { description: 'forming | paying | active | paymentFailed | cancelled' })
  status: string;
  @Field(() => String)
  planReason: string;
  @Field(() => String)
  mpPreapprovalPlanId: string;
  @Field(() => Boolean)
  isCreator: boolean;
  @Field(() => Boolean)
  isPayer: boolean;
  @Field(() => String, { nullable: true, description: 'Sólo para los miembros aceptados' })
  inviteCode: string | null;
  @Field(() => [FriendGroupMemberModel])
  members: FriendGroupMemberModel[];
  @Field(() => FriendGroupPricingModel, {
    nullable: true,
    description: 'Mientras se arma: precio con los aceptados. Pagado: lo que se cobra.',
  })
  pricing: FriendGroupPricingModel | null;
  @Field(() => FriendPlanTier, {
    nullable: true,
    description: 'Mientras se arma: el precio si se suma uno más',
  })
  nextTier: FriendPlanTier | null;
  @Field(() => Boolean)
  canPay: boolean;
  @Field(() => String, { nullable: true, description: 'Por qué todavía no se puede pagar' })
  payBlockedReason: string | null;
  @Field(() => String, { nullable: true })
  payerName: string | null;
  @Field(() => String, { nullable: true, description: 'Sólo para quien paga (cambiar la tarjeta)' })
  mpPreapprovalId: string | null;
  @Field(() => String, { nullable: true })
  cancelReason: string | null;
  @Field(() => String, { nullable: true })
  activatedAt: string | null;
  @Field(() => String, { nullable: true })
  paymentFailedAt: string | null;
}

@ObjectType()
export class FriendGroupInvitationModel {
  @Field(() => ID)
  groupId: string;
  @Field(() => String)
  planReason: string;
  @Field(() => String, { nullable: true })
  invitedByName: string | null;
  @Field(() => Int, { description: 'Aceptados hasta ahora' })
  acceptedCount: number;
  @Field(() => FriendPlanTier, { nullable: true, description: 'El precio si se suma' })
  tierIfJoins: FriendPlanTier | null;
}

@ObjectType()
export class MyFriendGroupResponse {
  @Field(() => FriendGroupModel, { nullable: true })
  group: FriendGroupModel | null;
  @Field(() => [FriendGroupInvitationModel])
  invitations: FriendGroupInvitationModel[];
}

@ObjectType()
export class FriendGroupPublicModel {
  @Field(() => String)
  planReason: string;
  @Field(() => String, { nullable: true })
  creatorName: string | null;
  @Field(() => Int, { description: 'Aceptados hasta ahora' })
  acceptedCount: number;
  @Field(() => String, { description: 'open | closed | full' })
  availability: string;
  @Field(() => Boolean)
  isMember: boolean;
  @Field(() => FriendPlanTier, { nullable: true, description: 'El precio si se suma' })
  tierIfJoins: FriendPlanTier | null;
}

@ObjectType()
export class PayFriendGroupResponse {
  @Field(() => String, { description: 'Estado del grupo después del pago' })
  status: string;
  @Field(() => String)
  message: string;
}
