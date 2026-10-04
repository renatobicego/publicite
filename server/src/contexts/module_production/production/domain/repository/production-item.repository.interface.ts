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
  /** Suma de bytes de los archivos del subárbol (para liberar el cupo de storage). */
  quotaBytes: number;
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
  countFolders(productionId: string): Promise<number>;
  /** Archivos y artículos sueltos en la raíz del blog (fuera de carpetas). */
  countRootFiles(productionId: string): Promise<number>;
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
  /**
   * Suma de `sizeBytes` de todos los archivos (kind:file) de los blogs dados.
   * Se usa para el cupo de almacenamiento POR USUARIO (suma entre sus blogs).
   */
  sumStorageBytesByProductions(
    productionIds: string[],
    session?: ClientSession,
  ): Promise<number>;
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
