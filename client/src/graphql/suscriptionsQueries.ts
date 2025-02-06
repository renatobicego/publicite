import gql from "graphql-tag";

export const getPaymentsQuery = gql`
  query FindPaymentByMongoId($findPaymentByMongoIdId: String!) {
    findPaymentByMongoId(id: $findPaymentByMongoIdId) {
      transactionAmount
      timeOfUpdate
      status_detail
      status
      _id
      paymentTypeId
      paymentMethodId
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
