import gql from "graphql-tag";

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const PRODUCTION_VIEWER_FIELDS = gql`
  fragment ProductionViewerFields on ProductionViewerResponse {
    role
    canViewContent
    canEdit
    canManageAccess
    canDelete
    canManagePayout
    isFan
    lockReason
    pendingReviewProductionId
  }
`;

const PRODUCTION_FIELDS = gql`
  ${PRODUCTION_VIEWER_FIELDS}
  fragment ProductionFields on ProductionResponse {
    _id
    owner
    ownerType
    creator
    title
    description
    url
    headerPhotoKey
    welcomeText
    welcomeVideoKey
    visibility
    shelf {
      category
      title
      link
      imageKey
    }
    showcase
    ownerInfo {
      _id
      name
      lastName
      businessName
      username
      alias
      profilePhotoUrl
    }
    filesCount
    filesPerBlogLimit
    fansCount
    rating
    reviewsCount
    isFeatured
    hasAccessKey
    aliasCbu
    moderationStatus
    createdAt
    updatedAt
    viewer {
      ...ProductionViewerFields
    }
  }
`;

const PRODUCTION_ITEM_FIELDS = gql`
  fragment ProductionItemFields on ProductionItemResponse {
    _id
    kind
    production
    parent
    name
    fileName
    fileType
    key
    postcard {
      latitude
      longitude
      authorship
      dedication
      description
    }
    blocks {
      type
      data
    }
    visibility
    effectiveVisibility
    moderationStatus
    createdAt
    updatedAt
    access {
      canViewContent
      lockReason
      ticket {
        _id
        isPaid
        price
        currency
        durationHours
        untilClose
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const findProductionByIdQuery = gql`
  ${PRODUCTION_FIELDS}
  query FindProductionById($productionId: ID!, $accessKey: String) {
    findProductionById(productionId: $productionId, accessKey: $accessKey) {
      ...ProductionFields
    }
  }
`;

export const findProductionByUrlQuery = gql`
  ${PRODUCTION_FIELDS}
  query FindProductionByUrl($url: String!, $accessKey: String) {
    findProductionByUrl(url: $url, accessKey: $accessKey) {
      ...ProductionFields
    }
  }
`;

export const getProductionItemsQuery = gql`
  ${PRODUCTION_FIELDS}
  ${PRODUCTION_ITEM_FIELDS}
  query GetProductionItems(
    $productionId: ID!
    $parentId: ID
    $accessKey: String
  ) {
    getProductionItems(
      productionId: $productionId
      parentId: $parentId
      accessKey: $accessKey
    ) {
      production {
        ...ProductionFields
      }
      items {
        ...ProductionItemFields
      }
      breadcrumb {
        _id
        name
      }
      parent {
        ...ProductionItemFields
      }
    }
  }
`;

export const getProductionItemByIdQuery = gql`
  ${PRODUCTION_ITEM_FIELDS}
  query GetProductionItemById($itemId: ID!, $accessKey: String) {
    getProductionItemById(itemId: $itemId, accessKey: $accessKey) {
      ...ProductionItemFields
    }
  }
`;

export const findAllProductionsByOwnerQuery = gql`
  ${PRODUCTION_FIELDS}
  query FindAllProductionsByOwner($ownerId: ID!, $ownerType: ProductionOwnerType) {
    findAllProductionsByOwner(ownerId: $ownerId, ownerType: $ownerType) {
      ...ProductionFields
    }
  }
`;

export const findAllProductionsQuery = gql`
  ${PRODUCTION_FIELDS}
  query FindAllProductions($page: Int!, $limit: Int!, $searchTerm: String) {
    findAllProductions(page: $page, limit: $limit, searchTerm: $searchTerm) {
      productions {
        ...ProductionFields
      }
      hasMore
    }
  }
`;

export const findFeaturedProductionsQuery = gql`
  ${PRODUCTION_FIELDS}
  query FindFeaturedProductions($limit: Int) {
    findFeaturedProductions(limit: $limit) {
      ...ProductionFields
    }
  }
`;

export const getProductionLimitsQuery = gql`
  query GetProductionLimits {
    getProductionLimits {
      personalBlogsAvailable
      groupBlogsAvailable
      filesPerBlogLimit
      canSellPaidTickets
    }
  }
`;

export const getProductionConsumptionQuery = gql`
  query GetProductionConsumption($productionId: ID) {
    getProductionConsumption(productionId: $productionId) {
      tokens {
        source
        allowance
        used
        remaining
        resetsAt
      }
      limits {
        personalBlogCount
        groupBlogCount
        totalPersonalBlogLimit
        totalGroupBlogLimit
        personalBlogsAvailable
        groupBlogsAvailable
        filesPerBlogLimit
        canSellPaidTickets
      }
      blogs {
        productionId
        title
        ownerType
        role
        filesCount
        filesPerBlogLimit
        filesAvailable
      }
    }
  }
`;

export const getProductionFansQuery = gql`
  query GetProductionFans($productionId: ID!, $page: Int, $limit: Int) {
    getProductionFans(productionId: $productionId, page: $page, limit: $limit) {
      fans {
        user
        userInfo {
          _id
          name
          lastName
          businessName
          username
          alias
          profilePhotoUrl
        }
        createdAt
      }
      total
      hasMore
    }
  }
`;

export const PRODUCTION_TICKET_FIELDS = gql`
  fragment ProductionTicketFields on ProductionTicketResponse {
    _id
    production
    target
    targetName
    isPaid
    price
    currency
    durationHours
    untilClose
    filesCount
    stats {
      purchases
      active
      revenue
    }
    createdAt
    updatedAt
  }
`;

export const getProductionTicketsQuery = gql`
  ${PRODUCTION_TICKET_FIELDS}
  query GetProductionTickets($productionId: ID!) {
    getProductionTickets(productionId: $productionId) {
      ...ProductionTicketFields
    }
  }
`;

const PRODUCTION_PAYMENT_INSTRUCTIONS_FIELDS = gql`
  fragment ProductionPaymentInstructionsFields on ProductionTicketPaymentInstructionsResponse {
    alias
    cbu
    holder
    bank
    amount
    currency
    reference
  }
`;

export const PRODUCTION_PURCHASE_FIELDS = gql`
  ${PRODUCTION_PAYMENT_INSTRUCTIONS_FIELDS}
  fragment ProductionPurchaseFields on ProductionTicketPurchaseResponse {
    _id
    ticket
    production
    productionTitle
    target
    targetName
    buyer
    buyerInfo {
      _id
      name
      lastName
      username
      email
    }
    creator
    status
    statusReason
    isPaid
    amount
    currency
    commissionPercent
    commissionAmount
    creatorPayoutAmount
    durationHours
    untilClose
    filesCount
    acceptedNoRefund
    transferReference
    confirmedAt
    activatedAt
    expiresAt
    payoutAliasCbu
    payoutStatus
    payoutAt
    facturaUrl
    facturaUploadedAt
    reviewRequired
    reviewedAt
    paymentInstructions {
      ...ProductionPaymentInstructionsFields
    }
    createdAt
  }
`;

// --- Staff: gestión de tickets ---

export const createProductionTicketMutation = gql`
  ${PRODUCTION_TICKET_FIELDS}
  mutation CreateProductionTicket(
    $ticketRequest: ProductionTicketCreateRequest!
  ) {
    createProductionTicket(ticketRequest: $ticketRequest) {
      ...ProductionTicketFields
    }
  }
`;

export const updateProductionTicketMutation = gql`
  ${PRODUCTION_TICKET_FIELDS}
  mutation UpdateProductionTicket(
    $ticketId: ID!
    $ticketUpdate: ProductionTicketUpdateRequest!
  ) {
    updateProductionTicket(ticketId: $ticketId, ticketUpdate: $ticketUpdate) {
      ...ProductionTicketFields
    }
  }
`;

export const deleteProductionTicketMutation = gql`
  mutation DeleteProductionTicket($ticketId: ID!) {
    deleteProductionTicket(ticketId: $ticketId)
  }
`;

export const getProductionTicketSalesQuery = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  query GetProductionTicketSales(
    $productionId: ID!
    $status: ProductionTicketPurchaseStatus
    $page: Int
    $limit: Int
  ) {
    getProductionTicketSales(
      productionId: $productionId
      status: $status
      page: $page
      limit: $limit
    ) {
      purchases {
        ...ProductionPurchaseFields
      }
      total
      hasMore
    }
  }
`;

export const activateProductionTicketPurchaseMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation ActivateProductionTicketPurchase($purchaseId: ID!) {
    activateProductionTicketPurchase(purchaseId: $purchaseId) {
      ...ProductionPurchaseFields
    }
  }
`;

export const setProductionPayoutAliasMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation SetProductionPayoutAlias($productionId: ID!, $aliasCbu: String!) {
    setProductionPayoutAlias(productionId: $productionId, aliasCbu: $aliasCbu) {
      ...ProductionFields
    }
  }
`;

// --- Visitante: compra ---

export const getProductionTicketCheckoutQuery = gql`
  ${PRODUCTION_TICKET_FIELDS}
  ${PRODUCTION_PURCHASE_FIELDS}
  query GetProductionTicketCheckout($ticketId: ID!) {
    getProductionTicketCheckout(ticketId: $ticketId) {
      ticket {
        ...ProductionTicketFields
      }
      productionTitle
      requiresNoRefundAcceptance
      noRefundWarning
      paymentInstructions {
        ...ProductionPaymentInstructionsFields
      }
      existingPurchase {
        ...ProductionPurchaseFields
      }
    }
  }
`;

export const purchaseProductionTicketMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation PurchaseProductionTicket(
    $purchaseRequest: ProductionTicketPurchaseRequest!
  ) {
    purchaseProductionTicket(purchaseRequest: $purchaseRequest) {
      ...ProductionPurchaseFields
    }
  }
`;

export const getMyProductionTicketPurchasesQuery = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  query GetMyProductionTicketPurchases(
    $status: ProductionTicketPurchaseStatus
    $page: Int
    $limit: Int
  ) {
    getMyProductionTicketPurchases(status: $status, page: $page, limit: $limit) {
      purchases {
        ...ProductionPurchaseFields
      }
      total
      hasMore
    }
  }
`;

// --- Admin: tickets (admin/invoices) ---

export const getProductionTicketPurchasesAdminQuery = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  query GetProductionTicketPurchasesAdmin(
    $page: Int!
    $limit: Int!
    $filters: ProductionTicketPurchaseFilters
  ) {
    getProductionTicketPurchasesAdmin(
      page: $page
      limit: $limit
      filters: $filters
    ) {
      purchases {
        ...ProductionPurchaseFields
      }
      total
      hasMore
    }
  }
`;

export const confirmProductionTicketPurchaseMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation ConfirmProductionTicketPurchase(
    $purchaseId: ID!
    $activate: Boolean
  ) {
    confirmProductionTicketPurchase(
      purchaseId: $purchaseId
      activate: $activate
    ) {
      ...ProductionPurchaseFields
    }
  }
`;

export const rejectProductionTicketPurchaseMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation RejectProductionTicketPurchase(
    $input: ProductionTicketRejectInput!
  ) {
    rejectProductionTicketPurchase(input: $input) {
      ...ProductionPurchaseFields
    }
  }
`;

export const activateProductionTicketPurchaseAsAdminMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation ActivateProductionTicketPurchaseAsAdmin($purchaseId: ID!) {
    activateProductionTicketPurchaseAsAdmin(purchaseId: $purchaseId) {
      ...ProductionPurchaseFields
    }
  }
`;

export const attachFacturaToProductionTicketPurchaseMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation AttachFacturaToProductionTicketPurchase(
    $input: AttachProductionTicketFacturaInput!
  ) {
    attachFacturaToProductionTicketPurchase(input: $input) {
      ...ProductionPurchaseFields
    }
  }
`;

export const markProductionTicketPayoutDoneMutation = gql`
  ${PRODUCTION_PURCHASE_FIELDS}
  mutation MarkProductionTicketPayoutDone($purchaseId: ID!) {
    markProductionTicketPayoutDone(purchaseId: $purchaseId) {
      ...ProductionPurchaseFields
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations — Blog
// ---------------------------------------------------------------------------

export const createProductionMutation = gql`
  mutation CreateProduction($productionRequest: ProductionCreateRequest!) {
    createProduction(productionRequest: $productionRequest) {
      _id
    }
  }
`;

export const updateProductionByIdMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation UpdateProductionById(
    $productionId: ID!
    $productionUpdate: ProductionUpdateRequest!
  ) {
    updateProductionById(
      productionId: $productionId
      productionUpdate: $productionUpdate
    ) {
      ...ProductionFields
    }
  }
`;

export const deleteProductionByIdMutation = gql`
  mutation DeleteProductionById($productionId: ID!) {
    deleteProductionById(productionId: $productionId)
  }
`;

// ---------------------------------------------------------------------------
// Mutations — Alcance y clave (Fase 3)
// ---------------------------------------------------------------------------

export const setProductionVisibilityMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation SetProductionVisibility(
    $productionId: ID!
    $visibility: Visibility_of_the_post!
  ) {
    setProductionVisibility(
      productionId: $productionId
      visibility: $visibility
    ) {
      ...ProductionFields
    }
  }
`;

export const setProductionItemVisibilityMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation SetProductionItemVisibility(
    $itemId: ID!
    $visibility: Visibility_of_the_post
  ) {
    setProductionItemVisibility(itemId: $itemId, visibility: $visibility) {
      ...ProductionItemFields
    }
  }
`;

export const setProductionAccessKeyMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation SetProductionAccessKey($productionId: ID!, $accessKey: String) {
    setProductionAccessKey(productionId: $productionId, accessKey: $accessKey) {
      ...ProductionFields
    }
  }
`;

export const unlockProductionWithKeyMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation UnlockProductionWithKey($productionId: ID!, $accessKey: String!) {
    unlockProductionWithKey(productionId: $productionId, accessKey: $accessKey) {
      ...ProductionFields
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations — Carpetas
// ---------------------------------------------------------------------------

export const createFolderMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation CreateFolder($folderRequest: ProductionFolderRequest!) {
    createFolder(folderRequest: $folderRequest) {
      ...ProductionItemFields
    }
  }
`;

export const updateFolderMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation UpdateFolder(
    $itemId: ID!
    $folderUpdate: ProductionFolderUpdateRequest!
  ) {
    updateFolder(itemId: $itemId, folderUpdate: $folderUpdate) {
      ...ProductionItemFields
    }
  }
`;

export const deleteFolderMutation = gql`
  mutation DeleteFolder($itemId: ID!) {
    deleteFolder(itemId: $itemId)
  }
`;

// ---------------------------------------------------------------------------
// Mutations — Archivos
// ---------------------------------------------------------------------------

export const uploadFileMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation UploadFile($fileRequest: ProductionFileRequest!) {
    uploadFile(fileRequest: $fileRequest) {
      ...ProductionItemFields
    }
  }
`;

export const updateFileMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation UpdateFile(
    $itemId: ID!
    $fileUpdate: ProductionFileUpdateRequest!
  ) {
    updateFile(itemId: $itemId, fileUpdate: $fileUpdate) {
      ...ProductionItemFields
    }
  }
`;

export const deleteFileMutation = gql`
  mutation DeleteFile($itemId: ID!) {
    deleteFile(itemId: $itemId)
  }
`;

// ---------------------------------------------------------------------------
// Mutations — Artículos (Editor.js)
// ---------------------------------------------------------------------------

export const createArticleMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation CreateArticle($articleRequest: ProductionArticleRequest!) {
    createArticle(articleRequest: $articleRequest) {
      ...ProductionItemFields
    }
  }
`;

export const updateArticleMutation = gql`
  ${PRODUCTION_ITEM_FIELDS}
  mutation UpdateArticle(
    $itemId: ID!
    $articleUpdate: ProductionArticleUpdateRequest!
  ) {
    updateArticle(itemId: $itemId, articleUpdate: $articleUpdate) {
      ...ProductionItemFields
    }
  }
`;

export const deleteArticleMutation = gql`
  mutation DeleteArticle($itemId: ID!) {
    deleteArticle(itemId: $itemId)
  }
`;

// ---------------------------------------------------------------------------
// SeudoBase (Fase 7)
// ---------------------------------------------------------------------------

const PRODUCTION_TICKET_SUMMARY_FIELDS = gql`
  fragment ProductionTicketSummaryFields on ProductionTicketSummaryResponse {
    _id
    isPaid
    price
    currency
    durationHours
    untilClose
  }
`;

export const getProductionSeudoBaseQuery = gql`
  ${PRODUCTION_TICKET_SUMMARY_FIELDS}
  query GetProductionSeudoBase(
    $productionId: ID!
    $filters: ProductionSeudoBaseFilters
    $page: Int
    $limit: Int
  ) {
    getProductionSeudoBase(
      productionId: $productionId
      filters: $filters
      page: $page
      limit: $limit
    ) {
      rows {
        _id
        kind
        name
        fileName
        fileType
        key
        parent
        path
        visibility
        effectiveVisibility
        ownTicket {
          ...ProductionTicketSummaryFields
        }
        effectiveTicket {
          ...ProductionTicketSummaryFields
        }
        price
        moderationStatus
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
`;

export const bulkUpdateProductionPricesMutation = gql`
  mutation BulkUpdateProductionPrices($input: ProductionBulkPriceInput!) {
    bulkUpdateProductionPrices(input: $input) {
      action
      requested
      affected
      skipped
      auditId
    }
  }
`;

export const bulkUpdateProductionVisibilityMutation = gql`
  mutation BulkUpdateProductionVisibility(
    $input: ProductionBulkVisibilityInput!
  ) {
    bulkUpdateProductionVisibility(input: $input) {
      action
      requested
      affected
      skipped
      auditId
    }
  }
`;

export const bulkDeleteProductionItemsMutation = gql`
  mutation BulkDeleteProductionItems($input: ProductionBulkDeleteInput!) {
    bulkDeleteProductionItems(input: $input) {
      action
      requested
      affected
      skipped
      auditId
    }
  }
`;

export const getProductionAuditLogQuery = gql`
  query GetProductionAuditLog($productionId: ID!, $page: Int, $limit: Int) {
    getProductionAuditLog(
      productionId: $productionId
      page: $page
      limit: $limit
    ) {
      entries {
        _id
        action
        actor
        actorInfo {
          _id
          name
          lastName
          businessName
          username
          alias
          profilePhotoUrl
        }
        itemIds
        affectedCount
        details
        createdAt
      }
      total
      hasMore
    }
  }
`;

// ---------------------------------------------------------------------------
// Fans, reseñas y comentarios (Fase 8)
// ---------------------------------------------------------------------------

const PRODUCTION_OWNER_INFO_FIELDS = gql`
  fragment ProductionOwnerInfoFields on ProductionOwnerResponse {
    _id
    name
    lastName
    businessName
    username
    alias
    profilePhotoUrl
  }
`;

// --- Fans ---

export const becomeProductionFanMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation BecomeProductionFan($productionId: ID!) {
    becomeProductionFan(productionId: $productionId) {
      ...ProductionFields
    }
  }
`;

export const stopBeingProductionFanMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation StopBeingProductionFan($productionId: ID!) {
    stopBeingProductionFan(productionId: $productionId) {
      ...ProductionFields
    }
  }
`;

export const getMyFanProductionsQuery = gql`
  ${PRODUCTION_FIELDS}
  query GetMyFanProductions($page: Int, $limit: Int) {
    getMyFanProductions(page: $page, limit: $limit) {
      productions {
        ...ProductionFields
      }
      hasMore
    }
  }
`;

// --- Reseñas ---

const PRODUCTION_REVIEW_FIELDS = gql`
  ${PRODUCTION_OWNER_INFO_FIELDS}
  fragment ProductionReviewFields on ProductionReviewResponse {
    _id
    production
    author
    authorInfo {
      ...ProductionOwnerInfoFields
    }
    review
    rating
    createdAt
    updatedAt
  }
`;

export const createProductionReviewMutation = gql`
  ${PRODUCTION_REVIEW_FIELDS}
  mutation CreateProductionReview($input: ProductionReviewInput!) {
    createProductionReview(input: $input) {
      ...ProductionReviewFields
    }
  }
`;

export const updateProductionReviewMutation = gql`
  ${PRODUCTION_REVIEW_FIELDS}
  mutation UpdateProductionReview(
    $reviewId: ID!
    $input: ProductionReviewUpdateInput!
  ) {
    updateProductionReview(reviewId: $reviewId, input: $input) {
      ...ProductionReviewFields
    }
  }
`;

export const deleteProductionReviewMutation = gql`
  mutation DeleteProductionReview($reviewId: ID!) {
    deleteProductionReview(reviewId: $reviewId)
  }
`;

export const getProductionReviewsQuery = gql`
  ${PRODUCTION_REVIEW_FIELDS}
  query GetProductionReviews($productionId: ID!, $page: Int, $limit: Int) {
    getProductionReviews(
      productionId: $productionId
      page: $page
      limit: $limit
    ) {
      reviews {
        ...ProductionReviewFields
      }
      total
      hasMore
      rating
    }
  }
`;

export const getMyPendingProductionReviewQuery = gql`
  query GetMyPendingProductionReview {
    getMyPendingProductionReview {
      productionId
      productionTitle
      purchaseId
      firstAccessAt
    }
  }
`;

// --- Comentarios ---

const PRODUCTION_COMMENT_FIELDS = gql`
  ${PRODUCTION_OWNER_INFO_FIELDS}
  fragment ProductionCommentFields on ProductionCommentResponse {
    _id
    production
    item
    user
    userInfo {
      ...ProductionOwnerInfoFields
    }
    comment
    isEdited
    response {
      _id
      user
      userInfo {
        ...ProductionOwnerInfoFields
      }
      comment
      isEdited
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
`;

export const createProductionCommentMutation = gql`
  ${PRODUCTION_COMMENT_FIELDS}
  mutation CreateProductionComment($input: ProductionCommentInput!) {
    createProductionComment(input: $input) {
      ...ProductionCommentFields
    }
  }
`;

export const replyProductionCommentMutation = gql`
  ${PRODUCTION_COMMENT_FIELDS}
  mutation ReplyProductionComment($commentId: ID!, $comment: String!) {
    replyProductionComment(commentId: $commentId, comment: $comment) {
      ...ProductionCommentFields
    }
  }
`;

export const updateProductionCommentMutation = gql`
  ${PRODUCTION_COMMENT_FIELDS}
  mutation UpdateProductionComment($commentId: ID!, $comment: String!) {
    updateProductionComment(commentId: $commentId, comment: $comment) {
      ...ProductionCommentFields
    }
  }
`;

export const deleteProductionCommentMutation = gql`
  mutation DeleteProductionComment($commentId: ID!) {
    deleteProductionComment(commentId: $commentId)
  }
`;

export const getProductionCommentsQuery = gql`
  ${PRODUCTION_COMMENT_FIELDS}
  query GetProductionComments(
    $productionId: ID!
    $itemId: ID
    $page: Int
    $limit: Int
  ) {
    getProductionComments(
      productionId: $productionId
      itemId: $itemId
      page: $page
      limit: $limit
    ) {
      comments {
        ...ProductionCommentFields
      }
      total
      hasMore
    }
  }
`;

// ---------------------------------------------------------------------------
// Denuncias / moderación (Fase 9)
// ---------------------------------------------------------------------------

export const reportProductionContentMutation = gql`
  mutation ReportProductionContent($input: ProductionReportInput!) {
    reportProductionContent(input: $input) {
      _id
      production
      item
      reason
      status
      contentHidden
      createdAt
    }
  }
`;

// --- Admin ---

export const getProductionReportTargetsAdminQuery = gql`
  query GetProductionReportTargetsAdmin(
    $status: ProductionReportStatus
    $page: Int
    $limit: Int
  ) {
    getProductionReportTargetsAdmin(
      status: $status
      page: $page
      limit: $limit
    ) {
      targets {
        production
        productionTitle
        ownerInfo {
          _id
          name
          lastName
          businessName
          username
          alias
          profilePhotoUrl
        }
        item
        itemName
        itemKind
        moderationStatus
        reports
        reasons
        lastReportAt
      }
      total
      hasMore
    }
  }
`;

export const getProductionTargetReportsAdminQuery = gql`
  query GetProductionTargetReportsAdmin($productionId: ID!, $itemId: ID) {
    getProductionTargetReportsAdmin(
      productionId: $productionId
      itemId: $itemId
    ) {
      _id
      reporter
      reporterInfo {
        _id
        name
        lastName
        username
        email
      }
      reason
      details
      status
      reviewedAt
      reviewedBy
      reviewNote
      createdAt
    }
  }
`;

export const moderateProductionContentMutation = gql`
  mutation ModerateProductionContent($input: ProductionModerationInput!) {
    moderateProductionContent(input: $input) {
      production
      item
      moderationStatus
      resolvedReports
    }
  }
`;

export const setProductionFeaturedMutation = gql`
  ${PRODUCTION_FIELDS}
  mutation SetProductionFeatured($productionId: ID!, $isFeatured: Boolean!) {
    setProductionFeatured(productionId: $productionId, isFeatured: $isFeatured) {
      ...ProductionFields
    }
  }
`;
