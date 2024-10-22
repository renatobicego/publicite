import { gql } from "@apollo/client";

const getBoardByUsernameQuery = gql`
  query GetUserByUsername($username: String!) {
    findUserByUsername(username: $username) {
      _id
      businessName
      lastName
      name
      profilePhotoUrl
      userType
      username
      board {
        _id
        annotations
        color
        keywords
        user
        visibility
      }
    }
  }
`;

const editBoardByUsernameMutation = gql`
  mutation UpdateBoardById(
    $updateBoardByIdId: String!
    $boardData: UpdateBoardDto!
    $ownerId: String!
  ) {
    updateBoardById(
      id: $updateBoardByIdId
      boardData: $boardData
      ownerId: $ownerId
    ) {
      _id
    }
  }
`;

const getBoardsQuery = gql`
  query GetBoardByAnnotationOrKeyword(
    $board: String!
    $limit: Float!
    $page: Float!
  ) {
    getBoardByAnnotationOrKeyword(board: $board, limit: $limit, page: $page) {
      boards {
        _id
        annotations
        user {
          profilePhotoUrl
          name
          lastName
          _id
        }
        visibility
        keywords
        color
      }
      hasMore
    }
  }
`;

export { getBoardByUsernameQuery, editBoardByUsernameMutation, getBoardsQuery };
