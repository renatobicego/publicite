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
      admins {
        username
        _id
      }
      details
      magazines
      members {
        username
        profilePhotoUrl
        _id
      }
      name
      profilePhotoUrl
      rules
      visibility
    }
  }
`;

export const getGroupsQuery = gql`
  query GetGroupByName($name: String!, $limit: Float) {
    getGroupByName(name: $name, limit: $limit) {
      groups {
        _id
        name
        members {
          _id
        }
        profilePhotoUrl
        visibility
      }
      hasMore
    }
  }
`;
