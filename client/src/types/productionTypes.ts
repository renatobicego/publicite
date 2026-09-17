// Tipos de "Mis Producciones" (module_production).
// Fuente: contrato-API-mis-producciones-FRONT.md.
// Se agregan por fase; esta primera tanda cubre el núcleo del blog (Fase 1).

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Alcance/visibilidad. Se reutiliza el enum del backend `Visibility_of_the_post`. */
export enum ProductionVisibility {
  public = "public",
  registered = "registered",
  contacts = "contacts",
  friends = "friends",
  topfriends = "topfriends",
}

export enum ProductionItemKind {
  folder = "folder",
  file = "file",
  article = "article",
}

export enum ProductionFileType {
  photo = "photo",
  video = "video",
  writing = "writing",
  audio = "audio",
}

export enum ProductionOwnerType {
  User = "User",
  Group = "Group",
}

export enum ProductionShelfCategory {
  movies = "movies",
  books = "books",
  websites = "websites",
  youtube = "youtube",
  games = "games",
  places = "places",
}

export enum ProductionRole {
  admin = "admin",
  moderator = "moderator",
  viewer = "viewer",
  visitor = "visitor",
}

export enum ProductionLockReason {
  accessKey = "accessKey",
  ticket = "ticket",
  pendingReview = "pendingReview",
  visibility = "visibility",
  moderation = "moderation",
}

export enum ProductionTicketPurchaseStatus {
  pending = "pending",
  confirmed = "confirmed",
  active = "active",
  expired = "expired",
  rejected = "rejected",
  cancelled = "cancelled",
}

export enum ProductionPayoutStatus {
  pending = "pending",
  done = "done",
}

export enum ProductionBulkAction {
  price = "price",
  visibility = "visibility",
  delete = "delete",
}

export enum ProductionPriceChangeMode {
  percentage = "percentage",
  fixed = "fixed",
}

export enum ProductionReportReason {
  inappropriate = "inappropriate",
  violence = "violence",
  sexual = "sexual",
  spam = "spam",
  copyright = "copyright",
  other = "other",
}

export enum ProductionReportStatus {
  pending = "pending",
  upheld = "upheld",
  dismissed = "dismissed",
}

export enum ProductionModerationAction {
  block = "block",
  restore = "restore",
}

// ---------------------------------------------------------------------------
// Bloques de artículo (Editor.js) — mismo contrato que Novedades
// ---------------------------------------------------------------------------

export interface ProductionArticleBlock {
  type: string;
  /** JSON stringificado del `data` del bloque. */
  data: string;
}

// ---------------------------------------------------------------------------
// Sub-objetos
// ---------------------------------------------------------------------------

export interface ProductionShelfLink {
  category: ProductionShelfCategory;
  title: string;
  link: string;
  imageKey?: string | null;
}

export interface ProductionPostcard {
  latitude?: number | null;
  longitude?: number | null;
  authorship?: string | null;
  dedication?: string | null;
  description?: string | null;
}

/** Flags de permiso del usuario actual sobre el blog. Usar SIEMPRE estos flags. */
export interface ProductionViewer {
  role: ProductionRole;
  canViewContent: boolean;
  canEdit: boolean;
  canManageAccess: boolean;
  canDelete: boolean;
  canManagePayout: boolean;
  isFan: boolean;
  lockReason: ProductionLockReason | null;
  pendingReviewProductionId: string | null;
}

export interface ProductionOwnerInfo {
  _id: string;
  name?: string | null;
  lastName?: string | null;
  businessName?: string | null;
  username?: string | null;
  alias?: string | null;
  profilePhotoUrl?: string | null;
}

export interface ProductionItemAccess {
  canViewContent: boolean;
  lockReason: ProductionLockReason | null;
  ticket?: ProductionAccessTicketInfo | null;
}

/** Resumen del ticket que bloquea un ítem (para el botón de compra). */
export interface ProductionAccessTicketInfo {
  _id: string;
  isPaid: boolean;
  price: number;
  currency: string;
  durationHours?: number | null;
  untilClose: boolean;
}

// ---------------------------------------------------------------------------
// Entidades principales
// ---------------------------------------------------------------------------

export interface ProductionResponse {
  _id: string;
  owner: string;
  ownerType: ProductionOwnerType;
  creator: string;
  title: string;
  description?: string | null;
  url: string;
  headerPhotoKey?: string | null;
  welcomeText?: string | null;
  welcomeVideoKey?: string | null;
  visibility: ProductionVisibility;
  shelf: ProductionShelfLink[];
  showcase: string[];
  ownerInfo?: ProductionOwnerInfo | null;
  filesCount: number;
  filesPerBlogLimit?: number | null; // sólo staff
  fansCount: number;
  rating?: number | null;
  reviewsCount?: number | null;
  isFeatured: boolean;
  hasAccessKey: boolean;
  aliasCbu?: string | null; // sólo admin del blog
  moderationStatus?: string | null; // sólo staff
  createdAt?: string | null;
  updatedAt?: string | null;
  viewer: ProductionViewer;
}

export interface ProductionItemResponse {
  _id: string;
  kind: ProductionItemKind;
  production: string;
  parent?: string | null;
  name: string;
  fileName?: string | null;
  // file
  fileType?: ProductionFileType | null;
  key?: string | null;
  postcard?: ProductionPostcard | null;
  // article
  blocks?: ProductionArticleBlock[] | null;
  // comunes
  visibility?: ProductionVisibility | null;
  effectiveVisibility: ProductionVisibility;
  moderationStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  access: ProductionItemAccess;
}

export interface ProductionBreadcrumbItem {
  _id: string;
  name: string;
}

export interface ProductionItemsResult {
  production: ProductionResponse;
  items: ProductionItemResponse[];
  breadcrumb: ProductionBreadcrumbItem[];
  parent?: ProductionItemResponse | null;
}

export interface ProductionListResult {
  productions: ProductionResponse[];
  hasMore: boolean;
}

export interface ProductionLimits {
  personalBlogCount: number;
  groupBlogCount: number;
  totalPersonalBlogLimit: number;
  totalGroupBlogLimit: number;
  personalBlogsAvailable: number;
  groupBlogsAvailable: number;
  filesPerBlogLimit: number;
  canSellPaidTickets: boolean;
}

// ---------------------------------------------------------------------------
// Inputs (requests)
// ---------------------------------------------------------------------------

export interface ProductionShelfLinkInput {
  category: ProductionShelfCategory;
  title: string;
  link: string;
}

export interface ProductionCreateRequest {
  title: string;
  description?: string;
  headerPhotoKey?: string;
  welcomeText?: string;
  welcomeVideoKey?: string;
  visibility?: ProductionVisibility;
  shelf?: ProductionShelfLinkInput[];
  groupId?: string;
}

export interface ProductionUpdateRequest {
  title?: string;
  description?: string;
  headerPhotoKey?: string;
  welcomeText?: string;
  welcomeVideoKey?: string;
  shelf?: ProductionShelfLinkInput[];
  showcase?: string[];
}

export interface ProductionFolderRequest {
  productionId: string;
  parentId?: string;
  name: string;
  visibility?: ProductionVisibility;
}

export interface ProductionFolderUpdateRequest {
  name?: string;
  visibility?: ProductionVisibility;
}

export interface ProductionPostcardInput {
  latitude?: number;
  longitude?: number;
  authorship?: string;
  dedication?: string;
  description?: string;
}

export interface ProductionFileRequest {
  productionId: string;
  parentId?: string;
  fileType: ProductionFileType;
  key: string;
  fileName?: string;
  name?: string;
  postcard?: ProductionPostcardInput;
}

export interface ProductionFileUpdateRequest {
  fileName?: string;
  name?: string;
  postcard?: ProductionPostcardInput;
}

export interface ProductionArticleBlockInput {
  type: string;
  data: string;
}

export interface ProductionArticleRequest {
  productionId: string;
  parentId?: string;
  title: string;
  fileName?: string;
  blocks: ProductionArticleBlockInput[];
}

export interface ProductionArticleUpdateRequest {
  title?: string;
  fileName?: string;
  blocks?: ProductionArticleBlockInput[];
}

// ---------------------------------------------------------------------------
// CONTROL Consumo (Fase 4)
// ---------------------------------------------------------------------------

export interface ProductionTokenConsumption {
  source: string; // 'plan' | 'free' | 'anonymous'
  allowance: number;
  used: number;
  remaining: number;
  resetsAt?: string | null;
}

export interface ProductionBlogConsumption {
  productionId: string;
  title: string;
  ownerType: ProductionOwnerType;
  role: ProductionRole;
  filesCount: number;
  filesPerBlogLimit: number;
  filesAvailable: number;
}

export interface ProductionConsumption {
  tokens?: ProductionTokenConsumption | null;
  limits: ProductionLimits;
  blogs: ProductionBlogConsumption[];
}

// ---------------------------------------------------------------------------
// Fans (Fase 4 / 8)
// ---------------------------------------------------------------------------

export interface ProductionFan {
  user: string;
  userInfo?: ProductionOwnerInfo | null;
  createdAt: string;
}

export interface ProductionFanList {
  fans: ProductionFan[];
  total: number;
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Tickets (Fase 4 lectura de staff; Fase 5 completa)
// ---------------------------------------------------------------------------

export interface ProductionTicketStats {
  purchases: number;
  active: number;
  revenue: number;
}

export interface ProductionTicket {
  _id: string;
  production: string;
  target?: string | null;
  targetName?: string | null;
  isPaid: boolean;
  price: number;
  currency: string;
  durationHours?: number | null;
  untilClose: boolean;
  filesCount: number;
  stats?: ProductionTicketStats | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// ---------------------------------------------------------------------------
// Tickets — compra / checkout (Fase 5)
// ---------------------------------------------------------------------------

export interface ProductionTicketPaymentInstructions {
  alias?: string | null;
  cbu?: string | null;
  holder?: string | null;
  bank?: string | null;
  amount: number;
  currency: string;
  reference?: string | null;
}

export interface ProductionTicketBuyer {
  _id: string;
  name?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
}

export interface ProductionTicketPurchase {
  _id: string;
  ticket: string;
  production: string;
  productionTitle: string;
  target?: string | null;
  targetName?: string | null;
  buyer: string;
  buyerInfo?: ProductionTicketBuyer | null;
  creator: string;
  status: ProductionTicketPurchaseStatus;
  statusReason?: string | null;
  isPaid: boolean;
  amount: number;
  currency: string;
  commissionPercent?: number | null;
  commissionAmount?: number | null;
  creatorPayoutAmount?: number | null;
  durationHours?: number | null;
  untilClose: boolean;
  filesCount: number;
  acceptedNoRefund: boolean;
  transferReference?: string | null;
  confirmedAt?: string | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  payoutAliasCbu?: string | null;
  payoutStatus?: ProductionPayoutStatus | null;
  payoutAt?: string | null;
  facturaUrl?: string | null;
  facturaUploadedAt?: string | null;
  reviewRequired: boolean;
  reviewedAt?: string | null;
  paymentInstructions?: ProductionTicketPaymentInstructions | null;
  createdAt?: string | null;
}

export interface ProductionTicketPurchaseList {
  purchases: ProductionTicketPurchase[];
  total: number;
  hasMore: boolean;
}

export interface ProductionTicketCheckout {
  ticket: ProductionTicket;
  productionTitle: string;
  requiresNoRefundAcceptance: boolean;
  noRefundWarning: string;
  paymentInstructions?: ProductionTicketPaymentInstructions | null;
  existingPurchase?: ProductionTicketPurchase | null;
}

// ---------------------------------------------------------------------------
// Tickets — inputs (Fase 5)
// ---------------------------------------------------------------------------

export interface ProductionTicketCreateRequest {
  productionId: string;
  targetId?: string;
  isPaid: boolean;
  price?: number;
  currency?: string;
  durationHours?: number;
  untilClose?: boolean;
}

export interface ProductionTicketUpdateRequest {
  isPaid?: boolean;
  price?: number;
  currency?: string;
  durationHours?: number;
  untilClose?: boolean;
}

export interface ProductionTicketPurchaseRequest {
  ticketId: string;
  acceptNoRefund: boolean;
  transferReference?: string;
}

// ---------------------------------------------------------------------------
// Tickets — admin (Fase 5)
// ---------------------------------------------------------------------------

export interface ProductionTicketPurchaseFilters {
  status?: ProductionTicketPurchaseStatus;
  productionId?: string;
  buyerId?: string;
  payoutStatus?: ProductionPayoutStatus;
  hasFactura?: boolean;
  isPaid?: boolean;
}

export interface AttachProductionTicketFacturaInput {
  purchaseId: string;
  facturaUrl: string;
}

export interface ProductionTicketRejectInput {
  purchaseId: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// SeudoBase (Fase 7)
// ---------------------------------------------------------------------------

export interface ProductionSeudoBaseRow {
  _id: string;
  kind: ProductionItemKind;
  name: string;
  fileName?: string | null;
  fileType?: ProductionFileType | null;
  key?: string | null;
  parent?: string | null;
  path?: string | null;
  visibility?: ProductionVisibility | null;
  effectiveVisibility: ProductionVisibility;
  ownTicket?: ProductionAccessTicketInfo | null;
  effectiveTicket?: ProductionAccessTicketInfo | null;
  price?: number | null;
  moderationStatus: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductionSeudoBase {
  rows: ProductionSeudoBaseRow[];
  total: number;
  hasMore: boolean;
}

export interface ProductionBulkResult {
  action: ProductionBulkAction;
  requested: number;
  affected: number;
  skipped: string[];
  auditId: string;
}

export interface ProductionAuditEntry {
  _id: string;
  action: ProductionBulkAction;
  actor: string;
  actorInfo?: ProductionOwnerInfo | null;
  itemIds: string[];
  affectedCount: number;
  details: string;
  createdAt: string;
}

export interface ProductionAuditLog {
  entries: ProductionAuditEntry[];
  total: number;
  hasMore: boolean;
}

// SeudoBase inputs
export interface ProductionSeudoBaseFilters {
  kinds?: ProductionItemKind[];
  parentId?: string;
  searchTerm?: string;
}

export interface ProductionBulkPriceInput {
  productionId: string;
  itemIds: string[];
  confirm: boolean;
  mode: ProductionPriceChangeMode;
  value: number;
}

export interface ProductionBulkVisibilityInput {
  productionId: string;
  itemIds: string[];
  confirm: boolean;
  visibility?: ProductionVisibility | null;
}

export interface ProductionBulkDeleteInput {
  productionId: string;
  itemIds: string[];
  confirm: boolean;
}

// ---------------------------------------------------------------------------
// Fans, reseñas y comentarios (Fase 8)
// ---------------------------------------------------------------------------

export interface ProductionReview {
  _id: string;
  production: string;
  author: string;
  authorInfo?: ProductionOwnerInfo | null;
  review: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionReviewList {
  reviews: ProductionReview[];
  total: number;
  hasMore: boolean;
  rating?: number | null;
}

export interface ProductionComment {
  _id: string;
  production: string;
  item?: string | null;
  user: string;
  userInfo?: ProductionOwnerInfo | null;
  comment: string;
  isEdited: boolean;
  response?: ProductionComment | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionCommentList {
  comments: ProductionComment[];
  total: number;
  hasMore: boolean;
}

export interface ProductionPendingReview {
  productionId: string;
  productionTitle: string;
  purchaseId: string;
  firstAccessAt?: string | null;
}

// inputs
export interface ProductionReviewInput {
  productionId: string;
  rating: number;
  review: string;
}

export interface ProductionReviewUpdateInput {
  rating?: number;
  review?: string;
}

export interface ProductionCommentInput {
  productionId: string;
  itemId?: string;
  comment: string;
}

// ---------------------------------------------------------------------------
// Denuncias / moderación (Fase 9)
// ---------------------------------------------------------------------------

export interface ProductionReport {
  _id: string;
  production: string;
  item?: string | null;
  reason: ProductionReportReason;
  status: ProductionReportStatus;
  contentHidden: boolean;
  createdAt: string;
}

export interface ProductionReportDetail {
  _id: string;
  reporter: string;
  reporterInfo?: ProductionTicketBuyer | null;
  reason: ProductionReportReason;
  details?: string | null;
  status: ProductionReportStatus;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNote?: string | null;
  createdAt: string;
}

export interface ProductionReportTarget {
  production: string;
  productionTitle?: string | null;
  ownerInfo?: ProductionOwnerInfo | null;
  item?: string | null;
  itemName?: string | null;
  itemKind?: ProductionItemKind | null;
  moderationStatus?: string | null;
  reports: number;
  reasons: ProductionReportReason[];
  lastReportAt: string;
}

export interface ProductionReportTargetList {
  targets: ProductionReportTarget[];
  total: number;
  hasMore: boolean;
}

export interface ProductionModerationResult {
  production: string;
  item?: string | null;
  moderationStatus: string;
  resolvedReports: number;
}

// inputs
export interface ProductionReportInput {
  productionId: string;
  itemId?: string;
  reason: ProductionReportReason;
  details?: string;
}

export interface ProductionModerationInput {
  productionId: string;
  itemId?: string;
  action: ProductionModerationAction;
  note?: string;
}
