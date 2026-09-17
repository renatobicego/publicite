"use server";
import {
  ProductionActionError,
  getProductionErrorMessage,
} from "@/utils/functions/productionErrorHandler";
import {
  createProductionService,
  updateProductionByIdService,
  deleteProductionByIdService,
  findProductionByIdService,
  findProductionByUrlService,
  findAllProductionsService,
  findAllProductionsByOwnerService,
  findFeaturedProductionsService,
  getProductionItemsService,
  getProductionItemByIdService,
  getProductionLimitsService,
  getProductionConsumptionService,
  getProductionFansService,
  getProductionTicketsService,
  getProductionTicketSalesService,
  getProductionTicketCheckoutService,
  getMyProductionTicketPurchasesService,
  createProductionTicketService,
  updateProductionTicketService,
  deleteProductionTicketService,
  activateProductionTicketPurchaseService,
  setProductionPayoutAliasService,
  purchaseProductionTicketService,
  getProductionTicketPurchasesAdminService,
  confirmProductionTicketPurchaseService,
  rejectProductionTicketPurchaseService,
  activateProductionTicketPurchaseAsAdminService,
  attachFacturaToProductionTicketPurchaseService,
  markProductionTicketPayoutDoneService,
  getProductionSeudoBaseService,
  bulkUpdateProductionPricesService,
  bulkUpdateProductionVisibilityService,
  bulkDeleteProductionItemsService,
  getProductionAuditLogService,
  becomeProductionFanService,
  stopBeingProductionFanService,
  getMyFanProductionsService,
  createProductionReviewService,
  updateProductionReviewService,
  deleteProductionReviewService,
  getProductionReviewsService,
  getMyPendingProductionReviewService,
  createProductionCommentService,
  replyProductionCommentService,
  updateProductionCommentService,
  deleteProductionCommentService,
  getProductionCommentsService,
  reportProductionContentService,
  getProductionReportTargetsAdminService,
  getProductionTargetReportsAdminService,
  moderateProductionContentService,
  setProductionFeaturedService,
  setProductionVisibilityService,
  setProductionItemVisibilityService,
  setProductionAccessKeyService,
  unlockProductionWithKeyService,
  createFolderService,
  updateFolderService,
  deleteFolderService,
  uploadFileService,
  updateFileService,
  deleteFileService,
  createArticleService,
  updateArticleService,
  deleteArticleService,
} from "@/services/productionsServices";
import {
  ProductionArticleRequest,
  ProductionArticleUpdateRequest,
  ProductionCreateRequest,
  ProductionFileRequest,
  ProductionFileUpdateRequest,
  ProductionFolderRequest,
  ProductionFolderUpdateRequest,
  ProductionItemResponse,
  ProductionItemsResult,
  ProductionLimits,
  ProductionListResult,
  ProductionOwnerType,
  ProductionResponse,
  ProductionUpdateRequest,
  ProductionVisibility,
  ProductionConsumption,
  ProductionFanList,
  ProductionTicket,
  ProductionTicketCreateRequest,
  ProductionTicketUpdateRequest,
  ProductionTicketPurchaseRequest,
  ProductionTicketPurchase,
  ProductionTicketPurchaseList,
  ProductionTicketCheckout,
  ProductionTicketPurchaseStatus,
  ProductionTicketPurchaseFilters,
  AttachProductionTicketFacturaInput,
  ProductionTicketRejectInput,
  ProductionSeudoBase,
  ProductionSeudoBaseFilters,
  ProductionBulkResult,
  ProductionBulkPriceInput,
  ProductionBulkVisibilityInput,
  ProductionBulkDeleteInput,
  ProductionAuditLog,
  ProductionReview,
  ProductionReviewList,
  ProductionReviewInput,
  ProductionReviewUpdateInput,
  ProductionComment,
  ProductionCommentList,
  ProductionCommentInput,
  ProductionPendingReview,
  ProductionReport,
  ProductionReportInput,
  ProductionReportStatus,
  ProductionReportTargetList,
  ProductionReportDetail,
  ProductionModerationInput,
  ProductionModerationResult,
} from "@/types/productionTypes";

// ---------------------------------------------------------------------------
// Manejo de errores
// ---------------------------------------------------------------------------
// Los errores de negocio de Producciones llegan con HTTP 200 y
// `errors[0].message = "Http Exception"`. El texto para el usuario y el código
// viajan en `extensions.originalError`. Ver `productionErrorHandler.ts`.

const toActionError = (error: unknown): ProductionActionError => ({
  error:
    getProductionErrorMessage(error) ??
    "Ocurrió un error inesperado. Por favor, intentá de nuevo.",
});

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

export const findProduction = async (
  productionId: string,
  accessKey?: string
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await findProductionByIdService(productionId, accessKey);
  } catch (error) {
    return toActionError(error);
  }
};

export const findProductionByUrl = async (
  url: string,
  accessKey?: string
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await findProductionByUrlService(url, accessKey);
  } catch (error) {
    return toActionError(error);
  }
};

export const findAllProductions = async (
  page: number,
  limit: number,
  searchTerm?: string
): Promise<ProductionListResult | ProductionActionError> => {
  try {
    return await findAllProductionsService(page, limit, searchTerm);
  } catch (error) {
    return toActionError(error);
  }
};

export const findAllProductionsByOwner = async (
  ownerId: string,
  ownerType?: ProductionOwnerType
): Promise<ProductionResponse[] | ProductionActionError> => {
  try {
    return await findAllProductionsByOwnerService(ownerId, ownerType);
  } catch (error) {
    return toActionError(error);
  }
};

export const findFeaturedProductions = async (
  limit?: number
): Promise<ProductionResponse[] | ProductionActionError> => {
  try {
    return await findFeaturedProductionsService(limit);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionItems = async (
  productionId: string,
  parentId?: string,
  accessKey?: string
): Promise<ProductionItemsResult | ProductionActionError> => {
  try {
    return await getProductionItemsService(productionId, parentId, accessKey);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionItemById = async (
  itemId: string,
  accessKey?: string
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await getProductionItemByIdService(itemId, accessKey);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionLimits = async (): Promise<
  ProductionLimits | ProductionActionError
> => {
  try {
    return await getProductionLimitsService();
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionConsumption = async (
  productionId?: string
): Promise<ProductionConsumption | ProductionActionError> => {
  try {
    return await getProductionConsumptionService(productionId);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionFans = async (
  productionId: string,
  page?: number,
  limit?: number
): Promise<ProductionFanList | ProductionActionError> => {
  try {
    return await getProductionFansService(productionId, page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionTickets = async (
  productionId: string
): Promise<ProductionTicket[] | ProductionActionError> => {
  try {
    return await getProductionTicketsService(productionId);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Tickets (Fase 5)
// ---------------------------------------------------------------------------

export const getProductionTicketSales = async (
  productionId: string,
  status?: ProductionTicketPurchaseStatus,
  page?: number,
  limit?: number
): Promise<ProductionTicketPurchaseList | ProductionActionError> => {
  try {
    return await getProductionTicketSalesService(
      productionId,
      status,
      page,
      limit
    );
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionTicketCheckout = async (
  ticketId: string
): Promise<ProductionTicketCheckout | ProductionActionError> => {
  try {
    return await getProductionTicketCheckoutService(ticketId);
  } catch (error) {
    return toActionError(error);
  }
};

export const getMyProductionTicketPurchases = async (
  status?: ProductionTicketPurchaseStatus,
  page?: number,
  limit?: number
): Promise<ProductionTicketPurchaseList | ProductionActionError> => {
  try {
    return await getMyProductionTicketPurchasesService(status, page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

export const createProductionTicket = async (
  ticketRequest: ProductionTicketCreateRequest
): Promise<ProductionTicket | ProductionActionError> => {
  try {
    return await createProductionTicketService(ticketRequest);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateProductionTicket = async (
  ticketId: string,
  ticketUpdate: ProductionTicketUpdateRequest
): Promise<ProductionTicket | ProductionActionError> => {
  try {
    return await updateProductionTicketService(ticketId, ticketUpdate);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteProductionTicket = async (
  ticketId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteProductionTicketService(ticketId);
  } catch (error) {
    return toActionError(error);
  }
};

export const activateProductionTicketPurchase = async (
  purchaseId: string
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await activateProductionTicketPurchaseService(purchaseId);
  } catch (error) {
    return toActionError(error);
  }
};

export const setProductionPayoutAlias = async (
  productionId: string,
  aliasCbu: string
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await setProductionPayoutAliasService(productionId, aliasCbu);
  } catch (error) {
    return toActionError(error);
  }
};

export const purchaseProductionTicket = async (
  purchaseRequest: ProductionTicketPurchaseRequest
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await purchaseProductionTicketService(purchaseRequest);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Tickets — admin (Fase 5)
// ---------------------------------------------------------------------------

export const getProductionTicketPurchasesAdmin = async (
  page: number,
  limit: number,
  filters?: ProductionTicketPurchaseFilters
): Promise<ProductionTicketPurchaseList | ProductionActionError> => {
  try {
    return await getProductionTicketPurchasesAdminService(page, limit, filters);
  } catch (error) {
    return toActionError(error);
  }
};

export const confirmProductionTicketPurchase = async (
  purchaseId: string,
  activate: boolean
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await confirmProductionTicketPurchaseService(purchaseId, activate);
  } catch (error) {
    return toActionError(error);
  }
};

export const rejectProductionTicketPurchase = async (
  input: ProductionTicketRejectInput
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await rejectProductionTicketPurchaseService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const activateProductionTicketPurchaseAsAdmin = async (
  purchaseId: string
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await activateProductionTicketPurchaseAsAdminService(purchaseId);
  } catch (error) {
    return toActionError(error);
  }
};

export const attachFacturaToProductionTicketPurchase = async (
  input: AttachProductionTicketFacturaInput
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await attachFacturaToProductionTicketPurchaseService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const markProductionTicketPayoutDone = async (
  purchaseId: string
): Promise<ProductionTicketPurchase | ProductionActionError> => {
  try {
    return await markProductionTicketPayoutDoneService(purchaseId);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const createProduction = async (
  productionRequest: ProductionCreateRequest
): Promise<{ _id: string } | ProductionActionError> => {
  try {
    return await createProductionService(productionRequest);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateProduction = async (
  productionId: string,
  productionUpdate: ProductionUpdateRequest
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await updateProductionByIdService(productionId, productionUpdate);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteProduction = async (
  productionId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteProductionByIdService(productionId);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Alcance y clave (Fase 3)
// ---------------------------------------------------------------------------

export const setProductionVisibility = async (
  productionId: string,
  visibility: ProductionVisibility
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await setProductionVisibilityService(productionId, visibility);
  } catch (error) {
    return toActionError(error);
  }
};

export const setProductionItemVisibility = async (
  itemId: string,
  visibility: ProductionVisibility | null
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await setProductionItemVisibilityService(itemId, visibility);
  } catch (error) {
    return toActionError(error);
  }
};

export const setProductionAccessKey = async (
  productionId: string,
  accessKey: string | null
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await setProductionAccessKeyService(productionId, accessKey);
  } catch (error) {
    return toActionError(error);
  }
};

export const unlockProductionWithKey = async (
  productionId: string,
  accessKey: string
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await unlockProductionWithKeyService(productionId, accessKey);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Carpetas
// ---------------------------------------------------------------------------

export const createFolder = async (
  folderRequest: ProductionFolderRequest
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await createFolderService(folderRequest);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateFolder = async (
  itemId: string,
  folderUpdate: ProductionFolderUpdateRequest
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await updateFolderService(itemId, folderUpdate);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteFolder = async (
  itemId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteFolderService(itemId);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Archivos
// ---------------------------------------------------------------------------

export const uploadFile = async (
  fileRequest: ProductionFileRequest
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await uploadFileService(fileRequest);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateFile = async (
  itemId: string,
  fileUpdate: ProductionFileUpdateRequest
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await updateFileService(itemId, fileUpdate);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteFile = async (
  itemId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteFileService(itemId);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Artículos (Editor.js)
// ---------------------------------------------------------------------------

export const createArticle = async (
  articleRequest: ProductionArticleRequest
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await createArticleService(articleRequest);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateArticle = async (
  itemId: string,
  articleUpdate: ProductionArticleUpdateRequest
): Promise<ProductionItemResponse | ProductionActionError> => {
  try {
    return await updateArticleService(itemId, articleUpdate);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteArticle = async (
  itemId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteArticleService(itemId);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// SeudoBase (Fase 7)
// ---------------------------------------------------------------------------

export const getProductionSeudoBase = async (
  productionId: string,
  filters?: ProductionSeudoBaseFilters,
  page?: number,
  limit?: number
): Promise<ProductionSeudoBase | ProductionActionError> => {
  try {
    return await getProductionSeudoBaseService(
      productionId,
      filters,
      page,
      limit
    );
  } catch (error) {
    return toActionError(error);
  }
};

export const bulkUpdateProductionPrices = async (
  input: ProductionBulkPriceInput
): Promise<ProductionBulkResult | ProductionActionError> => {
  try {
    return await bulkUpdateProductionPricesService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const bulkUpdateProductionVisibility = async (
  input: ProductionBulkVisibilityInput
): Promise<ProductionBulkResult | ProductionActionError> => {
  try {
    return await bulkUpdateProductionVisibilityService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const bulkDeleteProductionItems = async (
  input: ProductionBulkDeleteInput
): Promise<ProductionBulkResult | ProductionActionError> => {
  try {
    return await bulkDeleteProductionItemsService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionAuditLog = async (
  productionId: string,
  page?: number,
  limit?: number
): Promise<ProductionAuditLog | ProductionActionError> => {
  try {
    return await getProductionAuditLogService(productionId, page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Fans, reseñas y comentarios (Fase 8)
// ---------------------------------------------------------------------------

export const becomeProductionFan = async (
  productionId: string
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await becomeProductionFanService(productionId);
  } catch (error) {
    return toActionError(error);
  }
};

export const stopBeingProductionFan = async (
  productionId: string
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await stopBeingProductionFanService(productionId);
  } catch (error) {
    return toActionError(error);
  }
};

export const getMyFanProductions = async (
  page?: number,
  limit?: number
): Promise<ProductionListResult | ProductionActionError> => {
  try {
    return await getMyFanProductionsService(page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

export const createProductionReview = async (
  input: ProductionReviewInput
): Promise<ProductionReview | ProductionActionError> => {
  try {
    return await createProductionReviewService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateProductionReview = async (
  reviewId: string,
  input: ProductionReviewUpdateInput
): Promise<ProductionReview | ProductionActionError> => {
  try {
    return await updateProductionReviewService(reviewId, input);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteProductionReview = async (
  reviewId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteProductionReviewService(reviewId);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionReviews = async (
  productionId: string,
  page?: number,
  limit?: number
): Promise<ProductionReviewList | ProductionActionError> => {
  try {
    return await getProductionReviewsService(productionId, page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

export const getMyPendingProductionReview = async (): Promise<
  ProductionPendingReview | null | ProductionActionError
> => {
  try {
    return await getMyPendingProductionReviewService();
  } catch (error) {
    return toActionError(error);
  }
};

export const createProductionComment = async (
  input: ProductionCommentInput
): Promise<ProductionComment | ProductionActionError> => {
  try {
    return await createProductionCommentService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const replyProductionComment = async (
  commentId: string,
  comment: string
): Promise<ProductionComment | ProductionActionError> => {
  try {
    return await replyProductionCommentService(commentId, comment);
  } catch (error) {
    return toActionError(error);
  }
};

export const updateProductionComment = async (
  commentId: string,
  comment: string
): Promise<ProductionComment | ProductionActionError> => {
  try {
    return await updateProductionCommentService(commentId, comment);
  } catch (error) {
    return toActionError(error);
  }
};

export const deleteProductionComment = async (
  commentId: string
): Promise<string | ProductionActionError> => {
  try {
    return await deleteProductionCommentService(commentId);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionComments = async (
  productionId: string,
  itemId?: string,
  page?: number,
  limit?: number
): Promise<ProductionCommentList | ProductionActionError> => {
  try {
    return await getProductionCommentsService(productionId, itemId, page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

// ---------------------------------------------------------------------------
// Denuncias / moderación (Fase 9)
// ---------------------------------------------------------------------------

export const reportProductionContent = async (
  input: ProductionReportInput
): Promise<ProductionReport | ProductionActionError> => {
  try {
    return await reportProductionContentService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionReportTargetsAdmin = async (
  status?: ProductionReportStatus,
  page?: number,
  limit?: number
): Promise<ProductionReportTargetList | ProductionActionError> => {
  try {
    return await getProductionReportTargetsAdminService(status, page, limit);
  } catch (error) {
    return toActionError(error);
  }
};

export const getProductionTargetReportsAdmin = async (
  productionId: string,
  itemId?: string
): Promise<ProductionReportDetail[] | ProductionActionError> => {
  try {
    return await getProductionTargetReportsAdminService(productionId, itemId);
  } catch (error) {
    return toActionError(error);
  }
};

export const moderateProductionContent = async (
  input: ProductionModerationInput
): Promise<ProductionModerationResult | ProductionActionError> => {
  try {
    return await moderateProductionContentService(input);
  } catch (error) {
    return toActionError(error);
  }
};

export const setProductionFeatured = async (
  productionId: string,
  isFeatured: boolean
): Promise<ProductionResponse | ProductionActionError> => {
  try {
    return await setProductionFeaturedService(productionId, isFeatured);
  } catch (error) {
    return toActionError(error);
  }
};
