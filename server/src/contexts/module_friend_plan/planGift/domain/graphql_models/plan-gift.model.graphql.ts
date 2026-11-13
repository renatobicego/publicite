import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlanGiftQuote {
  @Field(() => Float, { description: 'Total a pagar (precio mensual del plan en MP × meses)' })
  amount: number;

  @Field(() => String)
  planReason: string;

  @Field(() => Int)
  months: number;

  @Field(() => [Int], { description: 'Meses que se pueden regalar' })
  monthOptions: number[];
}

@ObjectType()
export class PlanGiftModel {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  planReason: string;

  @Field(() => Int)
  months: number;

  @Field(() => Float)
  amount: number;

  @Field(() => String, { description: 'pendingPayment | paid | active | expired | rejected | refunded' })
  status: string;

  @Field(() => String, { nullable: true })
  giverName: string | null;

  @Field(() => String, { nullable: true })
  recipientName: string | null;

  @Field(() => String, { nullable: true, description: 'Sólo lo ve quien regala' })
  recipientEmail: string | null;

  @Field(() => Boolean, { description: 'El destinatario lo puede activar ahora' })
  canActivate: boolean;

  @Field(() => String, { description: 'Link para compartir: /canjear/<código>' })
  link: string;

  @Field(() => String, { nullable: true })
  activatedAt: string | null;

  @Field(() => String, { nullable: true })
  expiresAt: string | null;

  @Field(() => String, { nullable: true })
  createdAt: string | null;
}

@ObjectType()
export class PlanGiftPublicModel {
  @Field(() => String)
  code: string;

  @Field(() => String)
  planReason: string;

  @Field(() => Int)
  months: number;

  @Field(() => String, { nullable: true })
  giverName: string | null;

  @Field(() => String, { description: 'available | used | unavailable' })
  availability: string;

  @Field(() => String, {
    nullable: true,
    description: 'Email al que está reservado, enmascarado (ma***@gmail.com)',
  })
  reservedForEmail: string | null;

  @Field(() => Boolean, { description: 'El regalo es para quien está mirando (ya asignado o por email)' })
  isForViewer: boolean;

  @Field(() => ID, { nullable: true, description: 'Sólo si es para quien está mirando' })
  giftId: string | null;
}

@ObjectType()
export class BuyPlanGiftResponse {
  @Field(() => ID)
  giftId: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  status: string;

  @Field(() => Boolean, { description: 'El destinatario ya tiene cuenta (se le avisó)' })
  recipientHasAccount: boolean;

  @Field(() => String)
  link: string;

  @Field(() => String, { description: 'Mensaje para mostrar a quien regala' })
  message: string;
}

@ObjectType()
export class MyPlanGiftsResponse {
  @Field(() => [PlanGiftModel])
  given: PlanGiftModel[];

  @Field(() => [PlanGiftModel])
  received: PlanGiftModel[];
}

@ObjectType()
export class AdminPlanGiftModel extends PlanGiftModel {
  @Field(() => String, { nullable: true })
  giverEmail: string | null;

  @Field(() => String, { nullable: true })
  mpPaymentId: string | null;

  @Field(() => String, { nullable: true })
  paymentStatus: string | null;
}

@ObjectType()
export class AdminPlanGiftsResponse {
  @Field(() => [AdminPlanGiftModel])
  gifts: AdminPlanGiftModel[];

  @Field(() => Boolean)
  hasMore: boolean;
}
