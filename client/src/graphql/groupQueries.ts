import { gql } from "@apollo/client";

export const createNewGroupMutation = gql`
  mutation CreateNewGroup($groupDto: GroupRequest!) {
    createNewGroup(groupDto: $groupDto) {
      _id
      members {
        _id
      }
      creator
      name
      profilePhotoUrl
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
      creator
      details
      magazines {
        sections {
          posts {
            _id
            imagesUrls
          }
          _id
        }
        name
        _id
      }
      members {
        username
        profilePhotoUrl
        _id
      }
      name
      profilePhotoUrl
      rules
      visibility
      alias
    }
  }
`;

export const getGroupMembersByIdQuery = gql`
  query GetGroupById($getGroupByIdId: String!) {
    getGroupById(id: $getGroupByIdId) {
      _id
      admins {
        username
        _id
      }

      members {
        username
        profilePhotoUrl
        businessName
        lastName
        name
        _id
      }
    }
  }
`;

export const getGroupAdminsByIdQuery = gql`
  query GetGroupById($getGroupByIdId: String!) {
    getGroupById(id: $getGroupByIdId) {
      _id
      admins {
        username
        _id
      }
      creator
      name
      profilePhotoUrl
    }
  }
`;

export const getGroupsQuery = gql`
  query GetGroupByNameOrAlias($name: String!, $limit: Float!, $page: Float!) {
    getGroupByNameOrAlias(name: $name, limit: $limit, page: $page) {
      groups {
        group {
          _id
          name
          members {
            _id
          }
          profilePhotoUrl
          visibility
        }
        isMember
        hasJoinRequest
        hasGroupRequest
      }
      hasMore
    }
  }
`;

export const validateGroupAliasQuery = gql`
  query Query($alias: String!) {
    isThisGroupExist(alias: $alias)
  }
`;

export const makeAdminMutation = gql`
  mutation AddAdminsToGroupByGroupId(
    $newAdmins: [String!]!
    $groupAdmin: String!
    $groupId: String!
  ) {
    addAdminsToGroupByGroupId(
      newAdmins: $newAdmins
      groupAdmin: $groupAdmin
      groupId: $groupId
    )
  }
`;

export const deleteMemberMutation = gql`
  mutation DeleteMembersFromGroupByGroupId(
    $membersToDelete: [String!]!
    $groupAdmin: String!
    $groupId: String!
  ) {
    deleteMembersFromGroupByGroupId(
      membersToDelete: $membersToDelete
      groupAdmin: $groupAdmin
      groupId: $groupId
    )
  }
`;

export const deleteAdminMutation = gql`
  mutation DeleteAdminsFromGroupByGroupId(
    $adminsToDelete: [String!]!
    $groupAdmin: String!
    $groupId: String!
  ) {
    deleteAdminsFromGroupByGroupId(
      adminsToDelete: $adminsToDelete
      groupAdmin: $groupAdmin
      groupId: $groupId
    )
  }
`;

export const editGroupMutation = gql`
  mutation UpdateGroupById($groupToUpdate: GroupUpdateRequest!) {
    updateGroupById(groupToUpdate: $groupToUpdate)
  }
`;

export const deleteGroupMutation = gql`
  mutation DeleteGroupById($groupId: String!, $groupCreator: String!) {
    deleteGroupById(groupId: $groupId, groupCreator: $groupCreator)
  }
`;

export const acceptGroupInvitationMutation = gql`
  mutation AcceptGroupInvitation($groupId: String!) {
    acceptGroupInvitation(groupId: $groupId)
  }
`;
