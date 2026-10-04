import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import { ProductionOwnerResponse } from './production.response';

@ObjectType({ description: 'Fan de un blog (FAN-01)' })
export class ProductionFanResponse {
  @Field(() => ID)
  user: string;

  @Field(() => ProductionOwnerResponse, { nullable: true })
  userInfo?: ProductionOwnerResponse | null;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class ProductionFanListResponse {
  @Field(() => [ProductionFanResponse])
  fans: ProductionFanResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType({ description: 'Reseña de una producción (REV-01)' })
export class ProductionReviewResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  production: string;

  @Field(() => ID)
  author: string;

  @Field(() => ProductionOwnerResponse, { nullable: true })
  authorInfo?: ProductionOwnerResponse | null;

  @Field(() => String)
  review: string;

  @Field(() => Int)
  rating: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ProductionReviewListResponse {
  @Field(() => [ProductionReviewResponse])
  reviews: ProductionReviewResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => Float, { nullable: true, description: 'Promedio de calificaciones' })
  rating?: number | null;
}

@ObjectType({ description: 'Comentario con la respuesta del staff (patrón PostComment)' })
export class ProductionCommentResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  production: string;

  @Field(() => ID, { nullable: true })
  item?: string | null;

  @Field(() => ID)
  user: string;

  @Field(() => ProductionOwnerResponse, { nullable: true })
  userInfo?: ProductionOwnerResponse | null;

  @Field(() => String)
  comment: string;

  @Field(() => Boolean)
  isEdited: boolean;

  @Field(() => ProductionCommentResponse, { nullable: true })
  response?: ProductionCommentResponse | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ProductionCommentListResponse {
  @Field(() => [ProductionCommentResponse])
  comments: ProductionCommentResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType({
  description:
    'Reseña pendiente que bloquea compras y visitas hasta completarla (REV-02)',
})
export class ProductionPendingReviewResponse {
  @Field(() => ID)
  productionId: string;

  @Field(() => String)
  productionTitle: string;

  @Field(() => ID)
  purchaseId: string;

  @Field(() => Date, { nullable: true })
  firstAccessAt?: Date | null;
}
