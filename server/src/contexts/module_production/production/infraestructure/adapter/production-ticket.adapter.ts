import { Inject, Injectable } from '@nestjs/common';

import { ProductionTicketAdapterInterface } from '../../application/adapter/production-ticket.adapter.interface';
import { ProductionTicketServiceInterface } from '../../domain/service/production-ticket.service.interface';
import {
  ProductionTicketCreateRequest,
  ProductionTicketPurchaseFilters,
  ProductionTicketPurchaseRequest,
  ProductionTicketUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-ticket.request';
import { ProductionTicketPurchaseStatus } from '../../domain/entity/enum/production-ticket.enums';

@Injectable()
export class ProductionTicketAdapter implements ProductionTicketAdapterInterface {
  constructor(
    @Inject('ProductionTicketServiceInterface')
    private readonly ticketService: ProductionTicketServiceInterface,
  ) {}

  createProductionTicket(request: ProductionTicketCreateRequest, userId: string) {
    return this.ticketService.createProductionTicket(request, userId);
  }

  updateProductionTicket(
    ticketId: string,
    request: ProductionTicketUpdateRequest,
    userId: string,
  ) {
    return this.ticketService.updateProductionTicket(ticketId, request, userId);
  }

  deleteProductionTicket(ticketId: string, userId: string) {
    return this.ticketService.deleteProductionTicket(ticketId, userId);
  }

  getProductionTickets(productionId: string, userId: string) {
    return this.ticketService.getProductionTickets(productionId, userId);
  }

  getProductionTicketSales(
    productionId: string,
    userId: string,
    status: ProductionTicketPurchaseStatus | undefined,
    page: number,
    limit: number,
  ) {
    return this.ticketService.getProductionTicketSales(
      productionId,
      userId,
      status,
      page,
      limit,
    );
  }

  activateProductionTicketPurchase(purchaseId: string, userId: string) {
    return this.ticketService.activateProductionTicketPurchase(
      purchaseId,
      userId,
    );
  }

  setProductionPayoutAlias(
    productionId: string,
    aliasCbu: string,
    userId: string,
  ) {
    return this.ticketService.setProductionPayoutAlias(
      productionId,
      aliasCbu,
      userId,
    );
  }

  getProductionTicketCheckout(ticketId: string, userId: string) {
    return this.ticketService.getProductionTicketCheckout(ticketId, userId);
  }

  purchaseProductionTicket(
    request: ProductionTicketPurchaseRequest,
    userId: string,
  ) {
    return this.ticketService.purchaseProductionTicket(request, userId);
  }

  getMyProductionTicketPurchases(
    userId: string,
    status: ProductionTicketPurchaseStatus | undefined,
    page: number,
    limit: number,
  ) {
    return this.ticketService.getMyProductionTicketPurchases(
      userId,
      status,
      page,
      limit,
    );
  }

  getProductionTicketPurchasesAdmin(
    filters: ProductionTicketPurchaseFilters | undefined,
    page: number,
    limit: number,
  ) {
    return this.ticketService.getProductionTicketPurchasesAdmin(
      filters,
      page,
      limit,
    );
  }

  confirmProductionTicketPurchase(
    purchaseId: string,
    adminId: string,
    activate: boolean,
  ) {
    return this.ticketService.confirmProductionTicketPurchase(
      purchaseId,
      adminId,
      activate,
    );
  }

  rejectProductionTicketPurchase(
    purchaseId: string,
    reason: string,
    adminId: string,
  ) {
    return this.ticketService.rejectProductionTicketPurchase(
      purchaseId,
      reason,
      adminId,
    );
  }

  activateProductionTicketPurchaseAsAdmin(purchaseId: string, adminId: string) {
    return this.ticketService.activateProductionTicketPurchaseAsAdmin(
      purchaseId,
      adminId,
    );
  }

  attachFacturaToProductionTicketPurchase(
    purchaseId: string,
    facturaUrl: string,
    adminId: string,
  ) {
    return this.ticketService.attachFacturaToProductionTicketPurchase(
      purchaseId,
      facturaUrl,
      adminId,
    );
  }

  markProductionTicketPayoutDone(purchaseId: string, adminId: string) {
    return this.ticketService.markProductionTicketPayoutDone(
      purchaseId,
      adminId,
    );
  }
}
