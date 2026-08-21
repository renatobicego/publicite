import gql from "graphql-tag";

export const getAllInvoicesAdminQuery = gql`
  query GetAllInvoicesAdmin(
    $page: Int!
    $limit: Int!
    $filters: AdminInvoiceFiltersInput
  ) {
    getAllInvoicesAdmin(page: $page, limit: $limit, filters: $filters) {
      total
      hasMore
      invoices {
        _id
        transactionAmount
        paymentStatus
        nextRetryDay
        timeOfUpdate
        status
        reason
        retryAttempts
        rejectionCode
        external_reference
        invoice_id
        currencyId
        userName
        userEmail
        userUsername
        facturaUrl
        facturaUploadedAt
        facturaUploadedBy
        paymentId {
          paymentTypeId
          paymentMethodId
          status
        }
      }
    }
  }
`;

export const attachFacturaMutation = gql`
  mutation AttachFacturaToInvoice($input: AttachFacturaInput!) {
    attachFacturaToInvoice(input: $input) {
      _id
      facturaUrl
      facturaUploadedAt
      facturaUploadedBy
    }
  }
`;
