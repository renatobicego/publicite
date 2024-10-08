import { gql } from "@apollo/client";

export const createNewGroupMutation = gql`
  mutation CreateNewGroup($groupDto: GroupRequest!) {
    createNewGroup(groupDto: $groupDto) {
      _id
    }
  }
`;

export const getGroupByIdQuery = gql`
  query GetGroupById($getGroupByIdId: String!) {
    getGroupById(id: $getGroupByIdId) {
      _id
      admins
      details
      magazines
      members {
        _id
        profilePhotoUrl
        username
      }
      name
      profilePhotoUrl
      rules
      visibility
    }
  }
`;
