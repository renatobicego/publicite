import { ClientSession } from 'mongoose';

import { PostType } from '../entity/enum/post-type.enum';
import { PostBehaviourType } from '../entity/enum/postBehaviourType.enum';
import { FrequencyPrice } from '../entity/enum/post-service-freq-type.enum';
import { Visibility } from '../entity/enum/post-visibility.enum';

/** Filtros de la vista tipo Excel de anuncios del usuario. */
export interface PostSeudoBaseSearchCriteria {
  authorId: string;
  postTypes?: PostType[];
  isActive?: boolean;
  searchRegex?: RegExp | null;
}

/** Fila cruda de un anuncio para la SeudoBase (sin formateo de GraphQL). */
export interface PostSeudoBaseRow {
  _id: string;
  postType: PostType;
  postBehaviourType: PostBehaviourType;
  title: string;
  imageUrl: string | null;
  price: number;
  toPrice: number | null;
  frequencyPrice: FrequencyPrice | null;
  visibility: Visibility;
  isActive: boolean;
  endDate: Date | null;
  createdAt: Date | null;
}

export interface PostSeudoBaseRepositoryInterface {
  /** Lista paginada de los anuncios del autor con filtros y búsqueda. */
  search(
    criteria: PostSeudoBaseSearchCriteria,
    page: number,
    limit: number,
  ): Promise<{ rows: PostSeudoBaseRow[]; total: number; hasMore: boolean }>;

  /**
   * Devuelve los anuncios (de los ids pedidos) cuyo `author` es `authorId`.
   * Sirve para validar pertenencia por lote y para leer el estado previo.
   */
  findOwnedByIds(
    authorId: string,
    postIds: string[],
  ): Promise<PostSeudoBaseRow[]>;

  /**
   * Setea un precio nuevo por anuncio (id → price). `toPrice` se incluye sólo
   * para los anuncios que tienen rango (Necesidades), para mantenerlo coherente.
   */
  bulkSetPrice(
    updates: { postId: string; price: number; toPrice?: number | null }[],
    session?: ClientSession,
  ): Promise<void>;

  /** Setea la frecuencia del precio en los anuncios indicados (service/petition). */
  bulkSetFrequency(
    authorId: string,
    postIds: string[],
    frequencyPrice: FrequencyPrice,
    session?: ClientSession,
  ): Promise<void>;

  /** Cambia `visibility.post` de los anuncios indicados. */
  bulkSetVisibility(
    authorId: string,
    postIds: string[],
    visibility: Visibility,
    session?: ClientSession,
  ): Promise<void>;

  /** Hard delete en cascada de un lote de anuncios (reviews/reactions/comments + $pull en User). */
  bulkDelete(
    authorId: string,
    postIds: string[],
    session?: ClientSession,
  ): Promise<void>;
}
