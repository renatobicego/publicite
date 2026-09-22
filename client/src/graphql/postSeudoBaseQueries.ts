import { gql } from "@apollo/client";

const POST_SEUDOBASE_ROW_FIELDS = gql`
  fragment PostSeudoBaseRowFields on PostSeudoBaseRowResponse {
    _id
    postType
    title
    imageUrl
    price
    visibility
    isActive
    endDate
    createdAt
  }
`;

const POST_BULK_RESULT_FIELDS = gql`
  fragment PostBulkResultFields on PostBulkResultResponse {
    action
    requested
    affected
    skipped
    auditId
  }
`;

export const getPostSeudoBaseQuery = gql`
  ${POST_SEUDOBASE_ROW_FIELDS}
  query GetPostSeudoBase(
    $filters: PostSeudoBaseFilters
    $page: Int
    $limit: Int
  ) {
    getPostSeudoBase(filters: $filters, page: $page, limit: $limit) {
      rows {
        ...PostSeudoBaseRowFields
      }
      total
      hasMore
    }
  }
`;

export const bulkUpdatePostPricesMutation = gql`
  ${POST_BULK_RESULT_FIELDS}
  mutation BulkUpdatePostPrices($input: PostBulkPriceInput!) {
    bulkUpdatePostPrices(input: $input) {
      ...PostBulkResultFields
    }
  }
`;

export const bulkUpdatePostVisibilityMutation = gql`
  ${POST_BULK_RESULT_FIELDS}
  mutation BulkUpdatePostVisibility($input: PostBulkVisibilityInput!) {
    bulkUpdatePostVisibility(input: $input) {
      ...PostBulkResultFields
    }
  }
`;

export const bulkDeletePostsMutation = gql`
  ${POST_BULK_RESULT_FIELDS}
  mutation BulkDeletePosts($input: PostBulkDeleteInput!) {
    bulkDeletePosts(input: $input) {
      ...PostBulkResultFields
    }
  }
`;
