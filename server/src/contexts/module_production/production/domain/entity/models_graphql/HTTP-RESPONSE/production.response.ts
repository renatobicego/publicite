import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import {
  ProductionFileType,
  ProductionItemKind,
  ProductionLockReason,
  ProductionModerationStatus,
  ProductionOwnerType,
  ProductionRole,
  ProductionShelfCategory,
} from '../../enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

@ObjectType()
export class ProductionIdResponse {
  @Field(() => ID)
  _id: string;
}

@ObjectType()
export class ProductionShelfLinkResponse {
  @Field(() => ProductionShelfCategory)
  category: ProductionShelfCategory;

  @Field(() => String)
  title: string;

  @Field(() => String)
  link: string;

  @Field(() => String, { nullable: true })
  imageKey?: string;
}

@ObjectType({ description: 'Datos públicos del dueño (usuario o grupo)' })
export class ProductionOwnerResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  businessName?: string;

  @Field(() => String, { nullable: true, description: 'Sólo usuarios' })
  username?: string;

  @Field(() => String, { nullable: true, description: 'Sólo grupos' })
  alias?: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl?: string;
}

@ObjectType({ description: 'Qué puede hacer quien consulta el blog' })
export class ProductionViewerResponse {
  @Field(() => ProductionRole)
  role: ProductionRole;

  @Field(() => Boolean)
  canViewContent: boolean;

  @Field(() => ProductionLockReason, { nullable: true })
  lockReason?: ProductionLockReason;

  @Field(() => Boolean, { description: 'Editar header, carpetas y archivos' })
  canEdit: boolean;

  @Field(() => Boolean, { description: 'Gestionar tickets, alcance y clave' })
  canManageAccess: boolean;

  @Field(() => Boolean)
  canDelete: boolean;

  @Field(() => Boolean, { description: 'Cargar el alias/CBU de cobro' })
  canManagePayout: boolean;

  @Field(() => Boolean)
  isFan: boolean;

  @Field(() => ID, {
    nullable: true,
    description:
      'Producción con una reseña pendiente que bloquea al visitante (REV-02)',
  })
  pendingReviewProductionId?: string | null;
}

@ObjectType()
export class ProductionResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  owner: string;

  @Field(() => ProductionOwnerType)
  ownerType: ProductionOwnerType;

  @Field(() => ProductionOwnerResponse, { nullable: true })
  ownerInfo?: ProductionOwnerResponse | null;

  @Field(() => ID, { description: 'Usuario contra cuyo plan cuentan los límites' })
  creator: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  headerPhotoKey?: string | null;

  @Field(() => String, { nullable: true })
  welcomeText?: string | null;

  @Field(() => String, { nullable: true })
  welcomeVideoKey?: string | null;

  @Field(() => String, { description: 'URL autogenerada del blog (BLG-02)' })
  url: string;

  @Field(() => [ProductionShelfLinkResponse])
  shelf: ProductionShelfLinkResponse[];

  @Field(() => [ID])
  showcase: string[];

  @Field(() => Visibility)
  visibility: Visibility;

  @Field(() => Boolean, { description: 'Si el blog pide clave (INV-01)' })
  hasAccessKey: boolean;

  @Field(() => Int, { description: 'Archivos + artículos del blog' })
  filesCount: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Cupo de archivos por blog (sólo staff)',
  })
  filesPerBlogLimit?: number | null;

  @Field(() => Int)
  fansCount: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Promedio de calificaciones de las reseñas',
  })
  rating?: number | null;

  @Field(() => Int, { nullable: true })
  reviewsCount?: number | null;

  @Field(() => Boolean)
  isFeatured: boolean;

  @Field(() => ProductionModerationStatus, {
    nullable: true,
    description: 'Sólo staff del blog',
  })
  moderationStatus?: ProductionModerationStatus | null;

  @Field(() => String, {
    nullable: true,
    description: 'Alias/CBU de cobro (sólo el admin del blog, TKT-11)',
  })
  aliasCbu?: string | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => ProductionViewerResponse)
  viewer: ProductionViewerResponse;
}

@ObjectType()
export class ProductionListResponse {
  @Field(() => [ProductionResponse])
  productions: ProductionResponse[];

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType()
export class ProductionPostcardResponse {
  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => String, { nullable: true })
  authorship?: string;

  @Field(() => String, { nullable: true })
  dedication?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@ObjectType()
export class ProductionArticleBlockResponse {
  @Field(() => String)
  type: string;

  @Field(() => String)
  data: string;
}

@ObjectType({ description: 'Ticket que habilita el contenido (TKT-01..04)' })
export class ProductionTicketSummaryResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => Boolean)
  isPaid: boolean;

  @Field(() => Float)
  price: number;

  @Field(() => String)
  currency: string;

  @Field(() => Int, { nullable: true })
  durationHours?: number | null;

  @Field(() => Boolean)
  untilClose: boolean;
}

@ObjectType()
export class ProductionItemAccessResponse {
  @Field(() => Boolean)
  canViewContent: boolean;

  @Field(() => ProductionLockReason, { nullable: true })
  lockReason?: ProductionLockReason;

  @Field(() => ProductionTicketSummaryResponse, { nullable: true })
  ticket?: ProductionTicketSummaryResponse | null;
}

@ObjectType()
export class ProductionItemResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  production: string;

  @Field(() => ID, { nullable: true })
  parent?: string | null;

  @Field(() => ProductionItemKind)
  kind: ProductionItemKind;

  @Field(() => String, {
    description: 'Nombre de la carpeta o título del archivo/artículo',
  })
  name: string;

  @Field(() => Visibility, {
    nullable: true,
    description: 'Alcance propio; null = hereda',
  })
  visibility?: Visibility | null;

  @Field(() => Visibility, { description: 'Alcance que efectivamente aplica' })
  effectiveVisibility: Visibility;

  @Field(() => String, { nullable: true, description: 'ID editable (BLG-13)' })
  fileName?: string;

  @Field(() => ProductionFileType, { nullable: true })
  fileType?: ProductionFileType;

  @Field(() => String, {
    nullable: true,
    description: 'Key de UploadThing; null si el contenido está bloqueado',
  })
  key?: string | null;

  @Field(() => ProductionPostcardResponse, { nullable: true })
  postcard?: ProductionPostcardResponse | null;

  @Field(() => [ProductionArticleBlockResponse], { nullable: true })
  blocks?: ProductionArticleBlockResponse[] | null;

  @Field(() => ProductionModerationStatus, {
    nullable: true,
    description: 'Sólo staff del blog',
  })
  moderationStatus?: ProductionModerationStatus | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => ProductionItemAccessResponse)
  access: ProductionItemAccessResponse;
}

@ObjectType()
export class ProductionBreadcrumbResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  name: string;
}

@ObjectType({ description: 'Grilla de un nivel del árbol (PC-06)' })
export class ProductionItemsResponse {
  @Field(() => ProductionResponse)
  production: ProductionResponse;

  @Field(() => ProductionItemResponse, { nullable: true })
  parent?: ProductionItemResponse | null;

  @Field(() => [ProductionBreadcrumbResponse], {
    description: 'Camino desde la raíz hasta la carpeta actual',
  })
  breadcrumb: ProductionBreadcrumbResponse[];

  @Field(() => [ProductionItemResponse])
  items: ProductionItemResponse[];
}

@ObjectType({ description: 'Límites de Mis Producciones del usuario (RNF-06)' })
export class ProductionLimitsResponse {
  @Field(() => Int)
  personalBlogCount: number;

  @Field(() => Int)
  groupBlogCount: number;

  @Field(() => Int)
  totalPersonalBlogLimit: number;

  @Field(() => Int)
  totalGroupBlogLimit: number;

  @Field(() => Int)
  personalBlogsAvailable: number;

  @Field(() => Int)
  groupBlogsAvailable: number;

  @Field(() => Int, { description: 'Cupo de archivos por blog' })
  filesPerBlogLimit: number;

  @Field(() => Boolean, {
    description: 'Si el plan permite emitir tickets pagos (PLN-02/03)',
  })
  canSellPaidTickets: boolean;
}
