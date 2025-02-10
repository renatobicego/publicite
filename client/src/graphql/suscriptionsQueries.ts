import gql from "graphql-tag";

export const getPaymentsQuery = gql`
  query GetAllInvoicesByExternalReferenceId($limit: Float!, $page: Float!) {
    getAllInvoicesByExternalReferenceId(limit: $limit, page: $page) {
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
        paymentId {
          paymentTypeId
          paymentMethodId
          status
        }
      }
    }
  }
`;

export const getPostNumbersOfUserQuery = gql`
  query GetPostAndContactLimit {
    getPostAndContactLimit {
      totalLibrePostLimit
      totalAgendaPostLimit
      librePostCount
      libreAvailable
      contactLimit
      contactCount
      agendaPostCount
      contactAvailable
      agendaAvailable
    }
  }
`;
