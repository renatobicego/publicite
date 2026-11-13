import gql from "graphql-tag";

// Hacete Amigo: grupo del plan compartido (uno paga por todos con descuento).

const TIER_FIELDS = `
  members
  discountPercent
  pricePerMember
  totalAmount
`;

const GROUP_FIELDS = `
  _id
  status
  planReason
  mpPreapprovalPlanId
  isCreator
  isPayer
  inviteCode
  members {
    userId
    name
    username
    profilePhotoUrl
    status
    isActivated
    isCreator
    isPayer
  }
  pricing {
    memberCount
    discountPercent
    planAmount
    pricePerMember
    totalAmount
  }
  nextTier {
    ${TIER_FIELDS}
  }
  canPay
  payBlockedReason
  payerName
  mpPreapprovalId
  cancelReason
  activatedAt
  paymentFailedAt
`;

const MY_GROUP_FIELDS = `
  group {
    ${GROUP_FIELDS}
  }
  invitations {
    groupId
    planReason
    invitedByName
    acceptedCount
    tierIfJoins {
      ${TIER_FIELDS}
    }
  }
`;

export const friendPlanOptionsQuery = gql`
  query FriendPlanOptions {
    friendPlanOptions {
      plans {
        mpPreapprovalPlanId
        planReason
        planAmount
        tiers {
          ${TIER_FIELDS}
        }
      }
      minMembers
      maxMembers
    }
  }
`;

export const myFriendGroupQuery = gql`
  query MyFriendGroup {
    myFriendGroup {
      ${MY_GROUP_FIELDS}
    }
  }
`;

export const friendGroupByInviteCodeQuery = gql`
  query FriendGroupByInviteCode($code: String!) {
    friendGroupByInviteCode(code: $code) {
      planReason
      creatorName
      acceptedCount
      availability
      isMember
      tierIfJoins {
        ${TIER_FIELDS}
      }
    }
  }
`;

export const friendGroupCheckoutQuery = gql`
  query FriendGroupCheckout($groupId: ID!) {
    friendGroupCheckout(groupId: $groupId) {
      memberCount
      discountPercent
      planAmount
      pricePerMember
      totalAmount
    }
  }
`;

export const createFriendGroupMutation = gql`
  mutation CreateFriendGroup($mpPreapprovalPlanId: String!) {
    createFriendGroup(mpPreapprovalPlanId: $mpPreapprovalPlanId) {
      ${GROUP_FIELDS}
    }
  }
`;

export const inviteToFriendGroupMutation = gql`
  mutation InviteToFriendGroup($groupId: ID!, $userId: ID!) {
    inviteToFriendGroup(groupId: $groupId, userId: $userId) {
      ${GROUP_FIELDS}
    }
  }
`;

export const respondFriendGroupInvitationMutation = gql`
  mutation RespondFriendGroupInvitation($groupId: ID!, $accept: Boolean!) {
    respondFriendGroupInvitation(groupId: $groupId, accept: $accept) {
      ${MY_GROUP_FIELDS}
    }
  }
`;

export const joinFriendGroupByInviteCodeMutation = gql`
  mutation JoinFriendGroupByInviteCode($code: String!) {
    joinFriendGroupByInviteCode(code: $code) {
      ${GROUP_FIELDS}
    }
  }
`;

export const regenerateFriendGroupInviteCodeMutation = gql`
  mutation RegenerateFriendGroupInviteCode($groupId: ID!) {
    regenerateFriendGroupInviteCode(groupId: $groupId) {
      ${GROUP_FIELDS}
    }
  }
`;

export const removeFriendGroupMemberMutation = gql`
  mutation RemoveFriendGroupMember($groupId: ID!, $userId: ID!) {
    removeFriendGroupMember(groupId: $groupId, userId: $userId) {
      ${GROUP_FIELDS}
    }
  }
`;

export const leaveFriendGroupMutation = gql`
  mutation LeaveFriendGroup($groupId: ID!) {
    leaveFriendGroup(groupId: $groupId)
  }
`;

export const payFriendGroupMutation = gql`
  mutation PayFriendGroup($input: PayFriendGroupInput!) {
    payFriendGroup(input: $input) {
      status
      message
    }
  }
`;
