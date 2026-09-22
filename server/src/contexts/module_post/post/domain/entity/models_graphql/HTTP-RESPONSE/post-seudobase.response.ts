import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import { PostType } from '../../enum/post-type.enum';
import { Visibility } from '../../enum/post-visibility.enum';
import { PostBulkAction } from '../../enum/post-seudobase.enums';

@ObjectType({
  description: 'Fila de la SeudoBase de Anuncios (Foto, Título, Precio, ...)',
})
export class PostSeudoBaseRowResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => PostType)
  postType: PostType;

  @Field(() => String, { description: 'Título del anuncio' })
  title: string;

  @Field(() => String, {
    nullable: true,
    description: 'URL/key de la imagen de portada (si el tipo la tiene)',
  })
  imageUrl?: string | null;

  @Field(() => Float, { description: 'Precio del anuncio' })
  price: number;

  @Field(() => Visibility)
  visibility: Visibility;

  @Field(() => Boolean, { description: 'Disponibilidad (isActive)' })
  isActive: boolean;

  @Field(() => Date, { nullable: true, description: 'Fecha de vencimiento' })
  endDate?: Date | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;
}

@ObjectType()
export class PostSeudoBaseResponse {
  @Field(() => [PostSeudoBaseRowResponse])
  rows: PostSeudoBaseRowResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType({ description: 'Resultado de una operación masiva de anuncios' })
export class PostBulkResultResponse {
  @Field(() => PostBulkAction)
  action: PostBulkAction;

  @Field(() => Int)
  requested: number;

  @Field(() => Int)
  affected: number;

  @Field(() => [ID], {
    description:
      'Anuncios que no se modificaron (ej. precio negociable en cambio porcentual)',
  })
  skipped: string[];

  @Field(() => ID)
  auditId: string;
}

@ObjectType({ description: 'Entrada de auditoría de una operación masiva (SB-03)' })
export class PostAuditEntryResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => PostBulkAction)
  action: PostBulkAction;

  @Field(() => ID)
  actor: string;

  @Field(() => [ID])
  postIds: string[];

  @Field(() => Int)
  affectedCount: number;

  @Field(() => String, { description: 'JSON con parámetros y antes/después' })
  details: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class PostAuditLogResponse {
  @Field(() => [PostAuditEntryResponse])
  entries: PostAuditEntryResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
