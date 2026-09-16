import {
  ProductionTicketCreateRequest,
  ProductionTicketPurchaseFilters,
  ProductionTicketPurchaseRequest,
  ProductionTicketUpdateRequest,
} from '../entity/models_graphql/HTTP-REQUEST/production-ticket.request';
import {
  ProductionTicketCheckoutResponse,
  ProductionTicketPurchaseListResponse,
  ProductionTicketPurchaseResponse,
  ProductionTicketResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production-ticket.response';
import { ProductionResponse } from '../entity/models_graphql/HTTP-RESPONSE/production.response';
import { ProductionTicketPurchaseStatus } from '../entity/enum/production-ticket.enums';

export interface ProductionTicketServiceInterface {
  // Staff del blog (Page de Ticket).
  createProductionTicket(
    request: ProductionTicketCreateRequest,
    userId: string,
  ): Promise<ProductionTicketResponse>;
  updateProductionTicket(
    ticketId: string,
    request: ProductionTicketUpdateRequest,
    userId: string,
  ): Promise<ProductionTicketResponse>;
  deleteProductionTicket(ticketId: string, userId: string): Promise<void>;
  getProductionTickets(
    productionId: string,
    userId: string,
  ): Promise<ProductionTicketResponse[]>;
  getProductionTicketSales(
    productionId: string,
    userId: string,
    status: ProductionTicketPurchaseStatus | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionTicketPurchaseListResponse>;
  activateProductionTicketPurchase(
    purchaseId: string,
    userId: string,
  ): Promise<ProductionTicketPurchaseResponse>;
  setProductionPayoutAlias(
    productionId: string,
    aliasCbu: string,
    userId: string,
  ): Promise<ProductionResponse>;

  // Visitante.
  getProductionTicketCheckout(
    ticketId: string,
    userId: string,
  ): Promise<ProductionTicketCheckoutResponse>;
  purchaseProductionTicket(
    request: ProductionTicketPurchaseRequest,
    userId: string,
  ): Promise<ProductionTicketPurchaseResponse>;
  getMyProductionTicketPurchases(
    userId: string,
    status: ProductionTicketPurchaseStatus | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionTicketPurchaseListResponse>;

  // Admin de la plataforma.
  getProductionTicketPurchasesAdmin(
    filters: ProductionTicketPurchaseFilters | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionTicketPurchaseListResponse>;
  confirmProductionTicketPurchase(
    purchaseId: string,
    adminId: string,
    activate: boolean,
  ): Promise<ProductionTicketPurchaseResponse>;
  rejectProductionTicketPurchase(
    purchaseId: string,
    reason: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse>;
  activateProductionTicketPurchaseAsAdmin(
    purchaseId: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse>;
  attachFacturaToProductionTicketPurchase(
    purchaseId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse>;
  markProductionTicketPayoutDone(
    purchaseId: string,
    adminId: string,
  ): Promise<ProductionTicketPurchaseResponse>;
}
