import gql from "graphql-tag";

// Regalo de planes: pago único por N meses de un plan, asignado a una cuenta o a un email.

const PLAN_GIFT_FIELDS = `
  _id
  code
  planReason
  months
  amount
  status
  giverName
  recipientName
  recipientEmail
  canActivate
  link
  activatedAt
  expiresAt
  createdAt
`;

export const planGiftQuoteQuery = gql`
  query PlanGiftQuote($mpPreapprovalPlanId: String!, $months: Int!) {
    planGiftQuote(mpPreapprovalPlanId: $mpPreapprovalPlanId, months: $months) {
      amount
      planReason
      months
      monthOptions
    }
  }
`;

export const buyPlanGiftMutation = gql`
  mutation BuyPlanGift($input: BuyPlanGiftInput!) {
    buyPlanGift(input: $input) {
      giftId
      code
      status
      recipientHasAccount
      link
      message
    }
  }
`;

export const planGiftByCodeQuery = gql`
  query PlanGiftByCode($code: String!) {
    planGiftByCode(code: $code) {
      code
      planReason
      months
      giverName
      availability
      reservedForEmail
      isForViewer
      giftId
    }
  }
`;

export const claimPlanGiftMutation = gql`
  mutation ClaimPlanGift($code: String!) {
    claimPlanGift(code: $code) {
      ${PLAN_GIFT_FIELDS}
    }
  }
`;

export const activatePlanGiftMutation = gql`
  mutation ActivatePlanGift($giftId: ID!) {
    activatePlanGift(giftId: $giftId) {
      ${PLAN_GIFT_FIELDS}
    }
  }
`;

export const updatePlanGiftEmailMutation = gql`
  mutation UpdatePlanGiftEmail($giftId: ID!, $email: String!) {
    updatePlanGiftEmail(giftId: $giftId, email: $email) {
      ${PLAN_GIFT_FIELDS}
    }
  }
`;

export const myPlanGiftsQuery = gql`
  query MyPlanGifts {
    myPlanGifts {
      given {
        ${PLAN_GIFT_FIELDS}
      }
      received {
        ${PLAN_GIFT_FIELDS}
      }
    }
  }
`;

export const planGiftsAdminQuery = gql`
  query PlanGiftsAdmin($page: Int!, $limit: Int!) {
    planGiftsAdmin(page: $page, limit: $limit) {
      gifts {
        ${PLAN_GIFT_FIELDS}
        giverEmail
        mpPaymentId
        paymentStatus
      }
      hasMore
    }
  }
`;
