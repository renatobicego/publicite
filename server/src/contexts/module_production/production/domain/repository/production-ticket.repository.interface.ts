import { ClientSession } from 'mongoose';

import {
  ProductionTicket,
  ProductionTicketPurchase,
} from '../entity/production-ticket.entity';
import {
  ProductionPayoutStatus,
  ProductionTicketPurchaseStatus,
} from '../entity/enum/production-ticket.enums';

export interface ProductionTicketRepositoryInterface {
  create(
    ticket: Omit<ProductionTicket, '_id'>,
    session?: ClientSession,
  ): Promise<string>;
  findById(id: string): Promise<ProductionTicket | null>;
  findByProduction(productionId: string): Promise<ProductionTicket[]>;
  /** Actualiza precios de varios tickets (SeudoBase, SB-02). */
  setPrices(
    updates: { ticketId: string; price: number }[],
    session?: ClientSession,
  ): Promise<void>;
  updateById(
    id: string,
    fields: Partial<ProductionTicket>,
  ): Promise<ProductionTicket | null>;
  deleteById(id: string, session?: ClientSession): Promise<void>;
  deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void>;
  /** Borra los tickets de los ítems borrados y devuelve sus ids. */
  deleteByTargets(
    productionId: string,
    targetIds: string[],
    session?: ClientSession,
  ): Promise<string[]>;
}

/** Totales de un ticket: bruto, comisión, neto del creador y lo ya liquidado. */
export interface ProductionTicketStats {
  purchases: number;
  active: number;
  revenue: number;
  netRevenue: number;
  commission: number;
  paidOut: number;
}

export const EMPTY_TICKET_STATS: ProductionTicketStats = {
  purchases: 0,
  active: 0,
  revenue: 0,
  netRevenue: 0,
  commission: 0,
  paidOut: 0,
};

/** Clave de `countByTargets` para el ticket de todo el blog (target null). */
export const BLOG_TARGET_KEY = '';

export interface ProductionPurchaseListFilter {
  ticketId?: string;
  /** Destino de la compra (carpeta, archivo o artículo). */
  targetId?: string;
  productionId?: string;
  productionIds?: string[];
  buyerId?: string;
  statuses?: ProductionTicketPurchaseStatus[];
  payoutStatus?: ProductionPayoutStatus;
  hasFactura?: boolean;
  isPaid?: boolean;
}

export interface ProductionTicketPurchaseRepositoryInterface {
  create(
    purchase: Omit<ProductionTicketPurchase, '_id'>,
    session?: ClientSession,
  ): Promise<string>;
  findById(id: string): Promise<ProductionTicketPurchase | null>;
  findOpen(
    ticketId: string,
    buyerId: string,
  ): Promise<ProductionTicketPurchase | null>;
  /** Compras activas y no vencidas del comprador en un blog. */
  findActiveByBuyer(
    buyerId: string,
    productionId: string,
    now: Date,
  ): Promise<ProductionTicketPurchase[]>;
  /**
   * Transición de estado atómica: sólo aplica si la compra sigue en alguno de
   * los estados esperados. Devuelve null si no aplicó.
   */
  transition(
    id: string,
    fromStatuses: ProductionTicketPurchaseStatus[],
    fields: Partial<ProductionTicketPurchase>,
  ): Promise<ProductionTicketPurchase | null>;
  updateById(
    id: string,
    fields: Partial<ProductionTicketPurchase>,
  ): Promise<ProductionTicketPurchase | null>;
  /** Marca como vencidas las compras activas cuyo acceso ya expiró (TKT-08). */
  expireOverdue(
    filter: ProductionPurchaseListFilter,
    now: Date,
  ): Promise<number>;
  list(
    filter: ProductionPurchaseListFilter,
    page: number,
    limit: number,
  ): Promise<{ purchases: ProductionTicketPurchase[]; total: number }>;
  /**
   * Totales por destino (clave: id del ítem, o BLOG_TARGET_KEY para todo el
   * blog). Se agrupa por destino y no por ticket: quitar un ticket y volver a
   * crearlo le cambia el id, y las ventas anteriores no se tienen que perder.
   */
  countByTargets(
    productionId: string,
    targets: (string | null)[],
  ): Promise<Map<string, ProductionTicketStats>>;
  /** Registra el primer uso del acceso (dispara la reseña obligatoria). */
  markFirstAccess(
    buyerId: string,
    purchaseIds: string[],
    now: Date,
  ): Promise<void>;
  /** Cierre del blog o de ítems: cancela las pendientes y vence las activas. */
  closeByFilter(
    filter: { productionId: string; ticketIds?: string[] },
    reason: string,
    now: Date,
    session?: ClientSession,
  ): Promise<void>;
  findPendingReview(buyerId: string): Promise<ProductionTicketPurchase | null>;
  markReviewed(
    buyerId: string,
    productionId: string,
    now: Date,
    session?: ClientSession,
  ): Promise<number>;
  hasPurchaseForProduction(buyerId: string, productionId: string): Promise<boolean>;
}
