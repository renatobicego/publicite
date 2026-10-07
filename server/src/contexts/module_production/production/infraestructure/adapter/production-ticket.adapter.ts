import { Inject, Injectable } from '@nestjs/common';

import { ProductionTicketAdapterInterface } from '../../application/adapter/production-ticket.adapter.interface';
import { ProductionTicketServiceInterface } from '../../domain/service/production-ticket.service.interface';
import {
  ProductionTicketCreateRequest,
  ProductionTicketPurchaseFilters,
  ProductionTicketPurchaseRequest,
  ProductionTicketUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-ticket.request';
import {
  ProductionCommissionStatus,
  ProductionTicketPurchaseStatus,
} from '../../domain/entity/enum/production-ticket.enums';

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
    targetId?: string,
  ) {
    return this.ticketService.getProductionTicketSales(
      productionId,
      userId,
      status,
      page,
      limit,
      targetId,
    );
  }

  activateProductionTicketPurchase(purchaseId: string, userId: string) {
    return this.ticketService.activateProductionTicketPurchase(
      purchaseId,
      userId,
    );
  }

  rejectProductionTicketPurchase(
    purchaseId: string,
    reason: string,
    userId: string,
  ) {
    return this.ticketService.rejectProductionTicketPurchase(
      purchaseId,
      reason,
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

  setProductionTicketCommissionStatus(
    purchaseId: string,
    status: ProductionCommissionStatus,
    adminId: string,
  ) {
    return this.ticketService.setProductionTicketCommissionStatus(
      purchaseId,
      status,
      adminId,
    );
  }

  rejectProductionTicketPurchaseAsAdmin(
    purchaseId: string,
    reason: string,
    adminId: string,
  ) {
    return this.ticketService.rejectProductionTicketPurchaseAsAdmin(
      purchaseId,
      reason,
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
}
