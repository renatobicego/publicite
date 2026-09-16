import {
  ProductionModerationStatus,
  ProductionOwnerType,
  ProductionShelfCategory,
} from './enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

export interface ProductionShelfLink {
  category: ProductionShelfCategory;
  title: string;
  link: string;
  imageKey?: string;
}

export interface ProductionProps {
  _id?: string;
  owner: string;
  ownerType: ProductionOwnerType;
  creator: string;
  title: string;
  description?: string;
  headerPhotoKey?: string;
  welcomeText?: string;
  welcomeVideoKey?: string;
  url: string;
  shelf?: ProductionShelfLink[];
  showcase?: string[];
  visibility?: Visibility;
  aliasCbu?: string;
  accessKeyHash?: string;
  accessKeyVersion?: number;
  filesCount?: number;
  fansCount?: number;
  ratingSum?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  moderationStatus?: ProductionModerationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Blog de "Mis Producciones" (BLG-01..06). Dueño polimórfico User | Group
 * (RNF-11). `creator` es siempre un usuario: el dueño en un blog personal o el
 * creator del grupo en un blog de grupo; contra su plan se evalúan los límites
 * (GRP-08/RNF-14).
 */
export class Production {
  private readonly props: ProductionProps;

  constructor(props: ProductionProps) {
    this.props = {
      shelf: [],
      showcase: [],
      visibility: Visibility.public,
      accessKeyVersion: 0,
      filesCount: 0,
      fansCount: 0,
      ratingSum: 0,
      reviewsCount: 0,
      isFeatured: false,
      moderationStatus: ProductionModerationStatus.active,
      ...props,
    };
  }

  get getId() {
    return this.props._id;
  }
  get getOwner() {
    return this.props.owner;
  }
  get getOwnerType() {
    return this.props.ownerType;
  }
  get getCreator() {
    return this.props.creator;
  }
  get getTitle() {
    return this.props.title;
  }
  get getDescription() {
    return this.props.description;
  }
  get getHeaderPhotoKey() {
    return this.props.headerPhotoKey;
  }
  get getWelcomeText() {
    return this.props.welcomeText;
  }
  get getWelcomeVideoKey() {
    return this.props.welcomeVideoKey;
  }
  get getUrl() {
    return this.props.url;
  }
  get getShelf() {
    return this.props.shelf;
  }
  get getShowcase() {
    return this.props.showcase;
  }
  get getVisibility() {
    return this.props.visibility;
  }
  get getAliasCbu() {
    return this.props.aliasCbu;
  }
  get getAccessKeyHash() {
    return this.props.accessKeyHash;
  }
  get getAccessKeyVersion() {
    return this.props.accessKeyVersion;
  }
  get getFilesCount() {
    return this.props.filesCount;
  }
  get getFansCount() {
    return this.props.fansCount;
  }
  get getReviewsCount() {
    return this.props.reviewsCount ?? 0;
  }
  /** Promedio de las calificaciones, con un decimal; null sin reseñas. */
  get getRating(): number | null {
    const count = this.props.reviewsCount ?? 0;
    if (count <= 0) return null;
    return Math.round(((this.props.ratingSum ?? 0) / count) * 10) / 10;
  }
  get getIsFeatured() {
    return this.props.isFeatured;
  }
  get getModerationStatus() {
    return this.props.moderationStatus;
  }
  get getCreatedAt() {
    return this.props.createdAt;
  }
  get getUpdatedAt() {
    return this.props.updatedAt;
  }

  get hasAccessKey(): boolean {
    return !!this.props.accessKeyHash;
  }

  get isGroupBlog(): boolean {
    return this.props.ownerType === ProductionOwnerType.Group;
  }

  /** Documento plano para persistir (sin `_id`, lo asigna Mongo). */
  toPersistence(): Omit<ProductionProps, '_id'> {
    const { _id, ...rest } = this.props;
    return rest;
  }

  static fromDocument(doc: any): Production {
    return new Production({
      _id: doc._id?.toString(),
      owner: doc.owner?._id?.toString() ?? doc.owner?.toString(),
      ownerType: doc.ownerType,
      creator: doc.creator?._id?.toString() ?? doc.creator?.toString(),
      title: doc.title,
      description: doc.description,
      headerPhotoKey: doc.headerPhotoKey,
      welcomeText: doc.welcomeText,
      welcomeVideoKey: doc.welcomeVideoKey,
      url: doc.url,
      shelf: doc.shelf ?? [],
      showcase: (doc.showcase ?? []).map((id: any) => id.toString()),
      visibility: doc.visibility,
      aliasCbu: doc.aliasCbu,
      accessKeyHash: doc.accessKeyHash,
      accessKeyVersion: doc.accessKeyVersion ?? 0,
      filesCount: doc.filesCount ?? 0,
      fansCount: doc.fansCount ?? 0,
      ratingSum: doc.ratingSum ?? 0,
      reviewsCount: doc.reviewsCount ?? 0,
      isFeatured: doc.isFeatured ?? false,
      moderationStatus:
        doc.moderationStatus ?? ProductionModerationStatus.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
