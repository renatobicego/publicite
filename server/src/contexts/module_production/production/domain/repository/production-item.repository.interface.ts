import { ClientSession } from 'mongoose';

import { ProductionItem } from '../entity/production-item.entity';
import {
  ProductionItemKind,
  ProductionModerationStatus,
} from '../entity/enum/production.enums';

export interface ProductionSubtree {
  ids: string[];
  /** Los que cuentan para el cupo (archivos + artículos). */
  quotaIds: string[];
}

export interface ProductionItemSearchFilter {
  productionId: string;
  kinds?: ProductionItemKind[];
  parentId?: string | null;
  searchRegex?: string | null;
  itemIds?: string[];
}

export interface ProductionItemRepositoryInterface {
  create(item: ProductionItem, session?: ClientSession): Promise<string>;
  findById(id: string, session?: ClientSession): Promise<ProductionItem | null>;
  findByIds(
    productionId: string,
    ids: string[],
    session?: ClientSession,
  ): Promise<ProductionItem[]>;
  /** Ítems de cualquier blog (panel de denuncias). */
  findManyByIds(ids: string[]): Promise<ProductionItem[]>;
  findChildren(
    productionId: string,
    parentId: string | null,
  ): Promise<ProductionItem[]>;
  /** Ancestros del ítem, del padre directo hacia la raíz. */
  findAncestors(itemId: string): Promise<ProductionItem[]>;
  /** Todas las carpetas del blog (para resolver herencias en lote). */
  findAllFolders(productionId: string): Promise<ProductionItem[]>;
  existsFileName(
    productionId: string,
    parentId: string | null,
    fileName: string,
    excludeId?: string,
    session?: ClientSession,
  ): Promise<boolean>;
  countByContainer(
    productionId: string,
    parentId: string | null,
    session?: ClientSession,
  ): Promise<number>;
  updateById(
    id: string,
    fields: Record<string, any>,
    session?: ClientSession,
  ): Promise<ProductionItem | null>;
  /** El ítem y todos sus descendientes. */
  findSubtree(itemId: string, session?: ClientSession): Promise<ProductionSubtree>;
  deleteByIds(ids: string[], session?: ClientSession): Promise<number>;
  deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<number>;
  search(
    filter: ProductionItemSearchFilter,
    page: number,
    limit: number,
  ): Promise<{ items: ProductionItem[]; total: number; hasMore: boolean }>;
  setVisibility(
    productionId: string,
    ids: string[],
    visibility: string | null,
    session?: ClientSession,
  ): Promise<number>;
  setModerationStatus(
    id: string,
    status: ProductionModerationStatus,
    session?: ClientSession,
  ): Promise<void>;
}
