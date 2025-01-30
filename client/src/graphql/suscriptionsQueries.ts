import gql from "graphql-tag";

export const getPaymentsQuery = gql`
  query FindPaymentByClerkId($findPaymentByClerkIdId: String!) {
    findPaymentByClerkId(id: $findPaymentByClerkIdId) {
      _id
      dateApproved
      external_reference
      mpPaymentId
      payerEmail
      payerId
      paymentMethodId
      paymentTypeId
      status
      status_detail
      timeOfUpdate
      transactionAmount
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
