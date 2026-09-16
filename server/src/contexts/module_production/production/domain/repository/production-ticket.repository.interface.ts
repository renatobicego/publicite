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

export interface ProductionPurchaseListFilter {
  ticketId?: string;
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
  countByTickets(ticketIds: string[]): Promise<
    Map<string, { purchases: number; active: number; revenue: number }>
  >;
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
