import gql from "graphql-tag";

// Pruebas de MercadoPago de la Fase 0 (sólo admin). Se borra al terminar las pruebas.

export const mpTestCreatePreapprovalMutation = gql`
  mutation MpTestCreatePreapproval(
    $amount: Float!
    $cardTokenId: String!
    $payerEmail: String!
  ) {
    mpTestCreatePreapproval(
      amount: $amount
      cardTokenId: $cardTokenId
      payerEmail: $payerEmail
    )
  }
`;

export const mpTestGetPreapprovalQuery = gql`
  query MpTestGetPreapproval($preapprovalId: String!) {
    mpTestGetPreapproval(preapprovalId: $preapprovalId)
  }
`;

export const mpTestSetPreapprovalStatusMutation = gql`
  mutation MpTestSetPreapprovalStatus(
    $preapprovalId: String!
    $status: String!
  ) {
    mpTestSetPreapprovalStatus(preapprovalId: $preapprovalId, status: $status)
  }
`;

export const mpTestCreatePaymentMutation = gql`
  mutation MpTestCreatePayment($input: MpTestPaymentInput!) {
    mpTestCreatePayment(input: $input)
  }
`;

export const mpTestEventsQuery = gql`
  query MpTestEvents($limit: Int) {
    mpTestEvents(limit: $limit) {
      _id
      topic
      action
      dataId
      externalReference
      status
      amount
      receivedAt
      payload
    }
  }
`;
