import { ClientSession } from 'mongoose';

export interface ProductionFanEntry {
  production: string;
  user: string;
  createdAt: Date;
}

export interface ProductionReview {
  _id: string;
  production: string;
  author: string;
  review: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionComment {
  _id: string;
  production: string;
  item: string | null;
  user: string;
  comment: string;
  isEdited: boolean;
  isReply: boolean;
  response: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Fans, reseñas y comentarios de Mis Producciones (§6). */
export interface ProductionCommunityRepositoryInterface {
  // Fans (FAN-01)
  addFan(
    productionId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<boolean>;
  removeFan(
    productionId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<boolean>;
  listFans(
    productionId: string,
    page: number,
    limit: number,
  ): Promise<{ fans: ProductionFanEntry[]; total: number }>;
  /** De estas producciones, en cuáles el usuario es fan. */
  findFanProductionIds(
    userId: string,
    productionIds: string[],
  ): Promise<Set<string>>;
  listFanProductionIds(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ productionIds: string[]; total: number }>;

  // Reseñas (REV-01)
  createReview(
    review: Omit<ProductionReview, '_id' | 'createdAt' | 'updatedAt'>,
    session?: ClientSession,
  ): Promise<string>;
  findReviewById(id: string): Promise<ProductionReview | null>;
  updateReview(
    id: string,
    fields: Partial<Pick<ProductionReview, 'review' | 'rating'>>,
    session?: ClientSession,
  ): Promise<ProductionReview | null>;
  deleteReview(id: string, session?: ClientSession): Promise<void>;
  listReviews(
    productionId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: ProductionReview[]; total: number }>;

  // Comentarios (REV-01)
  createComment(
    comment: Omit<
      ProductionComment,
      '_id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'response'
    >,
    session?: ClientSession,
  ): Promise<string>;
  findCommentById(id: string): Promise<ProductionComment | null>;
  findCommentsByIds(ids: string[]): Promise<ProductionComment[]>;
  updateComment(id: string, comment: string): Promise<ProductionComment | null>;
  setCommentResponse(
    commentId: string,
    responseId: string | null,
    session?: ClientSession,
  ): Promise<void>;
  deleteComments(ids: string[], session?: ClientSession): Promise<void>;
  /** Quita la referencia a una respuesta que se borró. */
  clearResponseReferences(
    replyId: string,
    session?: ClientSession,
  ): Promise<void>;
  listComments(
    productionId: string,
    itemId: string | null,
    page: number,
    limit: number,
  ): Promise<{ comments: ProductionComment[]; total: number }>;

  // Cascada (RNF-05)
  deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void>;
  deleteCommentsByItems(
    productionId: string,
    itemIds: string[],
    session?: ClientSession,
  ): Promise<void>;
}
