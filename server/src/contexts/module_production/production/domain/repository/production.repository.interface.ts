import { ClientSession } from 'mongoose';

import { Production } from '../entity/production.entity';
import {
  ProductionModerationStatus,
  ProductionOwnerType,
} from '../entity/enum/production.enums';

export interface ProductionOwnerInfo {
  _id: string;
  name?: string;
  lastName?: string;
  businessName?: string;
  username?: string;
  alias?: string;
  profilePhotoUrl?: string;
}

export interface ProductionGroupRoster {
  _id: string;
  creator?: any;
  admins?: any[];
  members?: any[];
}

export interface ProductionListFilter {
  /** Condiciones de alcance ya armadas por el service (VIS-01). */
  visibilityConditions: Record<string, any>[];
  searchRegex?: string | null;
  ownerId?: string;
  ownerType?: ProductionOwnerType;
  /** Incluir blogs con clave (sólo en el cartel del dueño). */
  includeKeyProtected: boolean;
  /** Incluir blogs ocultos/bloqueados (sólo staff). */
  includeModerated: boolean;
}

export interface ProductionRepositoryInterface {
  create(production: Production, session?: ClientSession): Promise<string>;
  findById(id: string, session?: ClientSession): Promise<Production | null>;
  findByUrl(url: string): Promise<Production | null>;
  findByIds(ids: string[]): Promise<Production[]>;
  /** Blogs creados por el usuario (personales y de grupo). */
  findByCreator(userId: string): Promise<Production[]>;
  findOwnerInfo(
    ownerId: string,
    ownerType: ProductionOwnerType,
  ): Promise<ProductionOwnerInfo | null>;
  findOwnersInfo(
    owners: { ownerId: string; ownerType: ProductionOwnerType }[],
  ): Promise<Map<string, ProductionOwnerInfo>>;
  /** Nombre, usuario y email de usuarios (paneles de tickets y fans). */
  findUsersInfo(
    userIds: string[],
  ): Promise<Map<string, ProductionOwnerInfo & { email?: string }>>;
  findList(
    filter: ProductionListFilter,
    page: number,
    limit: number,
  ): Promise<{ productions: Production[]; hasMore: boolean }>;
  findFeatured(
    filter: ProductionListFilter,
    limit: number,
  ): Promise<Production[]>;
  updateById(
    id: string,
    fields: Record<string, any>,
    session?: ClientSession,
  ): Promise<Production | null>;
  deleteById(id: string, session?: ClientSession): Promise<void>;

  /**
   * Suma 1 al contador de archivos sólo si no supera el límite. Es la
   * validación atómica del cupo (PLN-05): dos subidas concurrentes no pueden
   * pasarse del límite.
   */
  tryIncrementFilesCount(
    id: string,
    limit: number,
    session?: ClientSession,
  ): Promise<boolean>;
  decrementFilesCount(
    id: string,
    amount: number,
    session?: ClientSession,
  ): Promise<void>;
  removeFromShowcase(
    id: string,
    itemIds: string[],
    session?: ClientSession,
  ): Promise<void>;

  setAccessKeyHash(
    id: string,
    accessKeyHash: string | null,
  ): Promise<Production | null>;
  incrementFansCount(
    id: string,
    amount: number,
    session?: ClientSession,
  ): Promise<void>;
  setModerationStatus(
    id: string,
    status: ProductionModerationStatus,
    session?: ClientSession,
  ): Promise<void>;

  findGroupRoster(groupId: string): Promise<ProductionGroupRoster | null>;
  /** Grupos donde el usuario es creator, admin o miembro, con ese rol. */
  findGroupRolesOfUser(
    userId: string,
  ): Promise<Map<string, 'creator' | 'admin' | 'member'>>;
  setFeatured(id: string, isFeatured: boolean): Promise<Production | null>;
  setGroupBlog(
    groupId: string,
    productionId: string | null,
    session?: ClientSession,
  ): Promise<void>;
}
