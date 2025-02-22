import { gql } from "@apollo/client";

const getBoardByUsernameQuery = gql`
  query GetUserByUsername($id: String!) {
    findUserById(_id: $id) {
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
  ) {
    updateBoardById(id: $updateBoardByIdId, boardData: $boardData) {
      _id
      annotations
      color
      keywords
      user
      visibility
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
          username
        }
        visibility
        keywords
        color
      }
      hasMore
    }
  }
`;

export const postBoardMutation = gql`
  mutation CreateBoard($boardRequest: BoardRequest!) {
    createBoard(boardRequest: $boardRequest) {
      _id
      annotations
      color
      keywords
      user
      visibility
    }
  }
`;

export { getBoardByUsernameQuery, editBoardByUsernameMutation, getBoardsQuery };
