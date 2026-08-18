import gql from "graphql-tag";

// ============================================================
// VALUACIÓN IA
// ============================================================

export const startValuacionMutation = gql`
  mutation StartValuacion($input: StartValuacionRequest!) {
    startValuacion(input: $input) {
      reply
      briefComplete
      valuacion {
        id
        status
        layer
        completionPercent
        title
        coveredFields
        briefItems { key label status }
        images { url }
        tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
      }
    }
  }
`;

export const sendValuacionMessageMutation = gql`
  mutation SendValuacionMessage($input: ValuacionMessageRequest!) {
    sendValuacionMessage(input: $input) {
      reply
      briefComplete
      limitReached
      valuacion {
        id
        status
        layer
        completionPercent
        title
        coveredFields
        briefItems { key label status }
        images { url }
        tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
      }
    }
  }
`;

export const skipValuacionBriefQuestionMutation = gql`
  mutation SkipValuacionBriefQuestion($valuacionId: String!) {
    skipValuacionBriefQuestion(valuacionId: $valuacionId) {
      reply
      briefComplete
      limitReached
      valuacion {
        id
        status
        layer
        completionPercent
        title
        coveredFields
        briefItems { key label status }
        images { url }
        tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
      }
    }
  }
`;

export const generateValuacionResultMutation = gql`
  mutation GenerateValuacionResult($valuacionId: String!) {
    generateValuacionResult(valuacionId: $valuacionId) {
      id
      status
      category
      layer
      completionPercent
      confidencePercent
      finalScore
      photoAnalysis {
        description brand model condition components damages confidence
        scores { estado marca mercado rareza }
      }
      title
      descriptiveAnalysis {
        summary confidence
        scores { uso vidaUtil mantenimiento documentacion }
        axisLabels { uso vidaUtil mantenimiento documentacion }
      }
      estimatedValues { liquidacion mercado premium currency }
      pricingRationale
      dataSources { field source }
      versionsCount
      coveredFields
      images { url }
      postId
      createdAt
      tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
    }
  }
`;

export const saveValuacionResultMutation = gql`
  mutation SaveValuacionResult($valuacionId: String!) {
    saveValuacionResult(valuacionId: $valuacionId) {
      id
      status
    }
  }
`;

export const restoreValuacionToBoardMutation = gql`
  mutation RestoreValuacionToBoard($valuacionId: String!) {
    restoreValuacionToBoard(valuacionId: $valuacionId) {
      id
      status
      category
      layer
      completionPercent
      confidencePercent
      finalScore
      photoAnalysis {
        description brand model condition components damages confidence
        scores { estado marca mercado rareza }
      }
      title
      descriptiveAnalysis {
        summary confidence
        scores { uso vidaUtil mantenimiento documentacion }
        axisLabels { uso vidaUtil mantenimiento documentacion }
      }
      estimatedValues { liquidacion mercado premium currency }
      pricingRationale
      dataSources { field source }
      versionsCount
      coveredFields
      images { url }
      postId
      createdAt
      tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
    }
  }
`;

export const deleteValuacionMutation = gql`
  mutation DeleteValuacion($valuacionId: String!) {
    deleteValuacion(valuacionId: $valuacionId)
  }
`;

export const linkValuacionToPostMutation = gql`
  mutation LinkValuacionToPost($valuacionId: String!, $postId: String!) {
    linkValuacionToPost(valuacionId: $valuacionId, postId: $postId) {
      id
      postId
    }
  }
`;

export const getUserValuacionesQuery = gql`
  query GetUserValuaciones($limit: Int, $page: Int) {
    getUserValuaciones(limit: $limit, page: $page) {
      valuaciones {
        id
        title
        category
        status
        layer
        finalScore
        createdAt
        estimatedValues { mercado }
      }
      total
      hasMore
    }
  }
`;

export const getValuacionByPostQuery = gql`
  query GetValuacionByPost($postId: String!) {
    getValuacionByPost(postId: $postId) {
      id
      layer
      finalScore
      estimatedValues { mercado }
    }
  }
`;

export const getValuacionPostDraftQuery = gql`
  query GetValuacionPostDraft($valuacionId: String!) {
    getValuacionPostDraft(valuacionId: $valuacionId) {
      title
      description
      suggestedPrice
      imageUrls
      brand
      modelType
      condition
      valuacionId
    }
  }
`;

// ============================================================
// MATCH IA
// ============================================================

export const searchMatchMutation = gql`
  mutation SearchMatch($input: SearchMatchRequest!) {
    searchMatch(input: $input) {
      matches {
        postId
        title
        description
        price
        imageUrl
        postType
        relevanceScore
        matchReason
      }
      interpretation
      candidatesEvaluated
      limitReached
      message
      tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
    }
  }
`;
