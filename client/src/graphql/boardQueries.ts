import { gql } from "@apollo/client";

const getBoardByUsernameQuery = gql`
  query GetUserByUsername($username: String!) {
    findOneByUsername(username: $username) {
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
  mutation UpdateBoardByUsername(
    $updateBoardByUsernameId: String!
    $boardData: UpdateBoardDto!
  ) {
    updateBoardByUsername(id: $updateBoardByUsernameId, boardData: $boardData) {
      _id
    }
  }
`;

export { getBoardByUsernameQuery, editBoardByUsernameMutation };
