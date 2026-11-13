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

export const startSubscriptionCheckoutMutation = gql`
  mutation StartSubscriptionCheckout($input: StartSubscriptionCheckoutInput!) {
    startSubscriptionCheckout(input: $input) {
      mpPreapprovalId
      status
      registered
      previousSubscriptionCancelled
      warning
    }
  }
`;

export const cancelMySubscriptionMutation = gql`
  mutation CancelMySubscription($mpPreapprovalId: String!) {
    cancelMySubscription(mpPreapprovalId: $mpPreapprovalId)
  }
`;

export const updateMySubscriptionCardMutation = gql`
  mutation UpdateMySubscriptionCard(
    $mpPreapprovalId: String!
    $cardTokenId: String!
  ) {
    updateMySubscriptionCard(
      mpPreapprovalId: $mpPreapprovalId
      cardTokenId: $cardTokenId
    )
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
