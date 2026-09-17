"use server";
import { getClient, query } from "@/lib/client";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";
import {
  createProductionMutation,
  updateProductionByIdMutation,
  deleteProductionByIdMutation,
  findProductionByIdQuery,
  findProductionByUrlQuery,
  findAllProductionsQuery,
  findAllProductionsByOwnerQuery,
  findFeaturedProductionsQuery,
  getProductionItemsQuery,
  getProductionItemByIdQuery,
  getProductionLimitsQuery,
  getProductionConsumptionQuery,
  getProductionFansQuery,
  getProductionTicketsQuery,
  getProductionTicketSalesQuery,
  getProductionTicketCheckoutQuery,
  getMyProductionTicketPurchasesQuery,
  createProductionTicketMutation,
  updateProductionTicketMutation,
  deleteProductionTicketMutation,
  activateProductionTicketPurchaseMutation,
  setProductionPayoutAliasMutation,
  purchaseProductionTicketMutation,
  getProductionTicketPurchasesAdminQuery,
  confirmProductionTicketPurchaseMutation,
  rejectProductionTicketPurchaseMutation,
  activateProductionTicketPurchaseAsAdminMutation,
  attachFacturaToProductionTicketPurchaseMutation,
  markProductionTicketPayoutDoneMutation,
  getProductionSeudoBaseQuery,
  bulkUpdateProductionPricesMutation,
  bulkUpdateProductionVisibilityMutation,
  bulkDeleteProductionItemsMutation,
  getProductionAuditLogQuery,
  becomeProductionFanMutation,
  stopBeingProductionFanMutation,
  getMyFanProductionsQuery,
  createProductionReviewMutation,
  updateProductionReviewMutation,
  deleteProductionReviewMutation,
  getProductionReviewsQuery,
  getMyPendingProductionReviewQuery,
  createProductionCommentMutation,
  replyProductionCommentMutation,
  updateProductionCommentMutation,
  deleteProductionCommentMutation,
  getProductionCommentsQuery,
  reportProductionContentMutation,
  getProductionReportTargetsAdminQuery,
  getProductionTargetReportsAdminQuery,
  moderateProductionContentMutation,
  setProductionFeaturedMutation,
  setProductionVisibilityMutation,
  setProductionItemVisibilityMutation,
  setProductionAccessKeyMutation,
  unlockProductionWithKeyMutation,
  createFolderMutation,
  updateFolderMutation,
  deleteFolderMutation,
  uploadFileMutation,
  updateFileMutation,
  deleteFileMutation,
  createArticleMutation,
  updateArticleMutation,
  deleteArticleMutation,
} from "@/graphql/productionQueries";
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
// Queries (lecturas: usan token opcional cuando corresponde)
// ---------------------------------------------------------------------------

export const findAllProductionsService = async (
  page: number,
  limit: number,
  searchTerm?: string
): Promise<ProductionListResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: findAllProductionsQuery,
    variables: { page, limit, searchTerm },
    context,
    fetchPolicy: "network-only",
  });
  return data.findAllProductions;
};

export const findAllProductionsByOwnerService = async (
  ownerId: string,
  ownerType?: ProductionOwnerType
): Promise<ProductionResponse[]> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: findAllProductionsByOwnerQuery,
    variables: { ownerId, ownerType },
    context,
    fetchPolicy: "network-only",
  });
  return data.findAllProductionsByOwner;
};

export const findFeaturedProductionsService = async (
  limit?: number
): Promise<ProductionResponse[]> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: findFeaturedProductionsQuery,
    variables: { limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.findFeaturedProductions;
};

export const findProductionByIdService = async (
  productionId: string,
  accessKey?: string
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: findProductionByIdQuery,
    variables: { productionId, accessKey },
    context,
    fetchPolicy: "network-only",
  });
  return data.findProductionById;
};

export const findProductionByUrlService = async (
  url: string,
  accessKey?: string
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: findProductionByUrlQuery,
    variables: { url, accessKey },
    context,
    fetchPolicy: "network-only",
  });
  return data.findProductionByUrl;
};

export const getProductionItemsService = async (
  productionId: string,
  parentId?: string,
  accessKey?: string
): Promise<ProductionItemsResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: getProductionItemsQuery,
    variables: { productionId, parentId, accessKey },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionItems;
};

export const getProductionItemByIdService = async (
  itemId: string,
  accessKey?: string
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: getProductionItemByIdQuery,
    variables: { itemId, accessKey },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionItemById;
};

export const getProductionLimitsService =
  async (): Promise<ProductionLimits> => {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await query({
      query: getProductionLimitsQuery,
      context,
      fetchPolicy: "network-only",
    });
    return data.getProductionLimits;
  };

export const getProductionConsumptionService = async (
  productionId?: string
): Promise<ProductionConsumption> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionConsumptionQuery,
    variables: { productionId },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionConsumption;
};

export const getProductionFansService = async (
  productionId: string,
  page?: number,
  limit?: number
): Promise<ProductionFanList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionFansQuery,
    variables: { productionId, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionFans;
};

export const getProductionTicketsService = async (
  productionId: string
): Promise<ProductionTicket[]> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionTicketsQuery,
    variables: { productionId },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionTickets;
};

export const getProductionTicketSalesService = async (
  productionId: string,
  status?: ProductionTicketPurchaseStatus,
  page?: number,
  limit?: number
): Promise<ProductionTicketPurchaseList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionTicketSalesQuery,
    variables: { productionId, status, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionTicketSales;
};

export const getProductionTicketCheckoutService = async (
  ticketId: string
): Promise<ProductionTicketCheckout> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionTicketCheckoutQuery,
    variables: { ticketId },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionTicketCheckout;
};

export const getMyProductionTicketPurchasesService = async (
  status?: ProductionTicketPurchaseStatus,
  page?: number,
  limit?: number
): Promise<ProductionTicketPurchaseList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getMyProductionTicketPurchasesQuery,
    variables: { status, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getMyProductionTicketPurchases;
};

// --- Mutations de tickets ---

export const createProductionTicketService = async (
  ticketRequest: ProductionTicketCreateRequest
): Promise<ProductionTicket> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: createProductionTicketMutation,
    variables: { ticketRequest },
    context,
  });
  return data.createProductionTicket;
};

export const updateProductionTicketService = async (
  ticketId: string,
  ticketUpdate: ProductionTicketUpdateRequest
): Promise<ProductionTicket> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateProductionTicketMutation,
    variables: { ticketId, ticketUpdate },
    context,
  });
  return data.updateProductionTicket;
};

export const deleteProductionTicketService = async (
  ticketId: string
): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteProductionTicketMutation,
    variables: { ticketId },
    context,
  });
  return data.deleteProductionTicket;
};

export const activateProductionTicketPurchaseService = async (
  purchaseId: string
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: activateProductionTicketPurchaseMutation,
    variables: { purchaseId },
    context,
  });
  return data.activateProductionTicketPurchase;
};

export const setProductionPayoutAliasService = async (
  productionId: string,
  aliasCbu: string
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: setProductionPayoutAliasMutation,
    variables: { productionId, aliasCbu },
    context,
  });
  return data.setProductionPayoutAlias;
};

export const purchaseProductionTicketService = async (
  purchaseRequest: ProductionTicketPurchaseRequest
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: purchaseProductionTicketMutation,
    variables: { purchaseRequest },
    context,
  });
  return data.purchaseProductionTicket;
};

// --- Admin: tickets ---

export const getProductionTicketPurchasesAdminService = async (
  page: number,
  limit: number,
  filters?: ProductionTicketPurchaseFilters
): Promise<ProductionTicketPurchaseList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionTicketPurchasesAdminQuery,
    variables: { page, limit, filters },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionTicketPurchasesAdmin;
};

export const confirmProductionTicketPurchaseService = async (
  purchaseId: string,
  activate: boolean
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: confirmProductionTicketPurchaseMutation,
    variables: { purchaseId, activate },
    context,
  });
  return data.confirmProductionTicketPurchase;
};

export const rejectProductionTicketPurchaseService = async (
  input: ProductionTicketRejectInput
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: rejectProductionTicketPurchaseMutation,
    variables: { input },
    context,
  });
  return data.rejectProductionTicketPurchase;
};

export const activateProductionTicketPurchaseAsAdminService = async (
  purchaseId: string
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: activateProductionTicketPurchaseAsAdminMutation,
    variables: { purchaseId },
    context,
  });
  return data.activateProductionTicketPurchaseAsAdmin;
};

export const attachFacturaToProductionTicketPurchaseService = async (
  input: AttachProductionTicketFacturaInput
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: attachFacturaToProductionTicketPurchaseMutation,
    variables: { input },
    context,
  });
  return data.attachFacturaToProductionTicketPurchase;
};

export const markProductionTicketPayoutDoneService = async (
  purchaseId: string
): Promise<ProductionTicketPurchase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: markProductionTicketPayoutDoneMutation,
    variables: { purchaseId },
    context,
  });
  return data.markProductionTicketPayoutDone;
};

// ---------------------------------------------------------------------------
// Mutations — Blog
// ---------------------------------------------------------------------------

export const createProductionService = async (
  productionRequest: ProductionCreateRequest
): Promise<{ _id: string }> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: createProductionMutation,
    variables: { productionRequest },
    context,
  });
  return data.createProduction;
};

export const updateProductionByIdService = async (
  productionId: string,
  productionUpdate: ProductionUpdateRequest
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateProductionByIdMutation,
    variables: { productionId, productionUpdate },
    context,
  });
  return data.updateProductionById;
};

export const deleteProductionByIdService = async (
  productionId: string
): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteProductionByIdMutation,
    variables: { productionId },
    context,
  });
  return data.deleteProductionById;
};

// ---------------------------------------------------------------------------
// Mutations — Alcance y clave (Fase 3)
// ---------------------------------------------------------------------------

export const setProductionVisibilityService = async (
  productionId: string,
  visibility: ProductionVisibility
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: setProductionVisibilityMutation,
    variables: { productionId, visibility },
    context,
  });
  return data.setProductionVisibility;
};

export const setProductionItemVisibilityService = async (
  itemId: string,
  visibility: ProductionVisibility | null
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: setProductionItemVisibilityMutation,
    variables: { itemId, visibility },
    context,
  });
  return data.setProductionItemVisibility;
};

export const setProductionAccessKeyService = async (
  productionId: string,
  accessKey: string | null
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: setProductionAccessKeyMutation,
    variables: { productionId, accessKey },
    context,
  });
  return data.setProductionAccessKey;
};

export const unlockProductionWithKeyService = async (
  productionId: string,
  accessKey: string
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: unlockProductionWithKeyMutation,
    variables: { productionId, accessKey },
    context,
  });
  return data.unlockProductionWithKey;
};

// ---------------------------------------------------------------------------
// Mutations — Carpetas
// ---------------------------------------------------------------------------

export const createFolderService = async (
  folderRequest: ProductionFolderRequest
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: createFolderMutation,
    variables: { folderRequest },
    context,
  });
  return data.createFolder;
};

export const updateFolderService = async (
  itemId: string,
  folderUpdate: ProductionFolderUpdateRequest
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateFolderMutation,
    variables: { itemId, folderUpdate },
    context,
  });
  return data.updateFolder;
};

export const deleteFolderService = async (
  itemId: string
): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteFolderMutation,
    variables: { itemId },
    context,
  });
  return data.deleteFolder;
};

// ---------------------------------------------------------------------------
// Mutations — Archivos
// ---------------------------------------------------------------------------

export const uploadFileService = async (
  fileRequest: ProductionFileRequest
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: uploadFileMutation,
    variables: { fileRequest },
    context,
  });
  return data.uploadFile;
};

export const updateFileService = async (
  itemId: string,
  fileUpdate: ProductionFileUpdateRequest
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateFileMutation,
    variables: { itemId, fileUpdate },
    context,
  });
  return data.updateFile;
};

export const deleteFileService = async (itemId: string): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteFileMutation,
    variables: { itemId },
    context,
  });
  return data.deleteFile;
};

// ---------------------------------------------------------------------------
// Mutations — Artículos (Editor.js)
// ---------------------------------------------------------------------------

export const createArticleService = async (
  articleRequest: ProductionArticleRequest
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: createArticleMutation,
    variables: { articleRequest },
    context,
  });
  return data.createArticle;
};

export const updateArticleService = async (
  itemId: string,
  articleUpdate: ProductionArticleUpdateRequest
): Promise<ProductionItemResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateArticleMutation,
    variables: { itemId, articleUpdate },
    context,
  });
  return data.updateArticle;
};

export const deleteArticleService = async (
  itemId: string
): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteArticleMutation,
    variables: { itemId },
    context,
  });
  return data.deleteArticle;
};

// ---------------------------------------------------------------------------
// SeudoBase (Fase 7)
// ---------------------------------------------------------------------------

export const getProductionSeudoBaseService = async (
  productionId: string,
  filters?: ProductionSeudoBaseFilters,
  page?: number,
  limit?: number
): Promise<ProductionSeudoBase> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionSeudoBaseQuery,
    variables: { productionId, filters, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionSeudoBase;
};

export const bulkUpdateProductionPricesService = async (
  input: ProductionBulkPriceInput
): Promise<ProductionBulkResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: bulkUpdateProductionPricesMutation,
    variables: { input },
    context,
  });
  return data.bulkUpdateProductionPrices;
};

export const bulkUpdateProductionVisibilityService = async (
  input: ProductionBulkVisibilityInput
): Promise<ProductionBulkResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: bulkUpdateProductionVisibilityMutation,
    variables: { input },
    context,
  });
  return data.bulkUpdateProductionVisibility;
};

export const bulkDeleteProductionItemsService = async (
  input: ProductionBulkDeleteInput
): Promise<ProductionBulkResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: bulkDeleteProductionItemsMutation,
    variables: { input },
    context,
  });
  return data.bulkDeleteProductionItems;
};

export const getProductionAuditLogService = async (
  productionId: string,
  page?: number,
  limit?: number
): Promise<ProductionAuditLog> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionAuditLogQuery,
    variables: { productionId, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionAuditLog;
};

// ---------------------------------------------------------------------------
// Fans, reseñas y comentarios (Fase 8)
// ---------------------------------------------------------------------------

export const becomeProductionFanService = async (
  productionId: string
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: becomeProductionFanMutation,
    variables: { productionId },
    context,
  });
  return data.becomeProductionFan;
};

export const stopBeingProductionFanService = async (
  productionId: string
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: stopBeingProductionFanMutation,
    variables: { productionId },
    context,
  });
  return data.stopBeingProductionFan;
};

export const getMyFanProductionsService = async (
  page?: number,
  limit?: number
): Promise<ProductionListResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getMyFanProductionsQuery,
    variables: { page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getMyFanProductions;
};

export const createProductionReviewService = async (
  input: ProductionReviewInput
): Promise<ProductionReview> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: createProductionReviewMutation,
    variables: { input },
    context,
  });
  return data.createProductionReview;
};

export const updateProductionReviewService = async (
  reviewId: string,
  input: ProductionReviewUpdateInput
): Promise<ProductionReview> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateProductionReviewMutation,
    variables: { reviewId, input },
    context,
  });
  return data.updateProductionReview;
};

export const deleteProductionReviewService = async (
  reviewId: string
): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteProductionReviewMutation,
    variables: { reviewId },
    context,
  });
  return data.deleteProductionReview;
};

export const getProductionReviewsService = async (
  productionId: string,
  page?: number,
  limit?: number
): Promise<ProductionReviewList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: getProductionReviewsQuery,
    variables: { productionId, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionReviews;
};

export const getMyPendingProductionReviewService =
  async (): Promise<ProductionPendingReview | null> => {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await query({
      query: getMyPendingProductionReviewQuery,
      context,
      fetchPolicy: "network-only",
    });
    return data.getMyPendingProductionReview;
  };

export const createProductionCommentService = async (
  input: ProductionCommentInput
): Promise<ProductionComment> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: createProductionCommentMutation,
    variables: { input },
    context,
  });
  return data.createProductionComment;
};

export const replyProductionCommentService = async (
  commentId: string,
  comment: string
): Promise<ProductionComment> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: replyProductionCommentMutation,
    variables: { commentId, comment },
    context,
  });
  return data.replyProductionComment;
};

export const updateProductionCommentService = async (
  commentId: string,
  comment: string
): Promise<ProductionComment> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: updateProductionCommentMutation,
    variables: { commentId, comment },
    context,
  });
  return data.updateProductionComment;
};

export const deleteProductionCommentService = async (
  commentId: string
): Promise<string> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: deleteProductionCommentMutation,
    variables: { commentId },
    context,
  });
  return data.deleteProductionComment;
};

export const getProductionCommentsService = async (
  productionId: string,
  itemId?: string,
  page?: number,
  limit?: number
): Promise<ProductionCommentList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(true, tokenCache);
  const { data } = await query({
    query: getProductionCommentsQuery,
    variables: { productionId, itemId, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionComments;
};

// ---------------------------------------------------------------------------
// Denuncias / moderación (Fase 9)
// ---------------------------------------------------------------------------

export const reportProductionContentService = async (
  input: ProductionReportInput
): Promise<ProductionReport> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: reportProductionContentMutation,
    variables: { input },
    context,
  });
  return data.reportProductionContent;
};

export const getProductionReportTargetsAdminService = async (
  status?: ProductionReportStatus,
  page?: number,
  limit?: number
): Promise<ProductionReportTargetList> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionReportTargetsAdminQuery,
    variables: { status, page, limit },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionReportTargetsAdmin;
};

export const getProductionTargetReportsAdminService = async (
  productionId: string,
  itemId?: string
): Promise<ProductionReportDetail[]> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await query({
    query: getProductionTargetReportsAdminQuery,
    variables: { productionId, itemId },
    context,
    fetchPolicy: "network-only",
  });
  return data.getProductionTargetReportsAdmin;
};

export const moderateProductionContentService = async (
  input: ProductionModerationInput
): Promise<ProductionModerationResult> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: moderateProductionContentMutation,
    variables: { input },
    context,
  });
  return data.moderateProductionContent;
};

export const setProductionFeaturedService = async (
  productionId: string,
  isFeatured: boolean
): Promise<ProductionResponse> => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  const { data } = await getClient().mutate({
    mutation: setProductionFeaturedMutation,
    variables: { productionId, isFeatured },
    context,
  });
  return data.setProductionFeatured;
};
