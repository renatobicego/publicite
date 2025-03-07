import { gql } from "@apollo/client";

export const createNewGroupMutation = gql`
  mutation CreateNewGroup($groupDto: GroupRequest!) {
    createNewGroup(groupDto: $groupDto) {
      _id
      members {
        _id
      }
      creator {
        _id
      }
      name
      profilePhotoUrl
    }
  }
`;

export const getGroupByIdQuery = gql`
  query GetGroupById($getGroupByIdId: String!) {
    getGroupById(id: $getGroupByIdId) {
      group {
        _id
        admins {
          username
          _id
          profilePhotoUrl
        }
        creator {
          username
          _id
          profilePhotoUrl
        }
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
        groupNote
        visibility
        alias
        groupNotificationsRequest {
          joinRequests {
            _id
            profilePhotoUrl
            username
          }
          groupInvitations {
            _id
          }
        }
      }
      isMember
      hasJoinRequest
      hasGroupRequest
    }
  }
`;

export const getGroupMembersByIdQuery = gql`
  query GetGroupById($getGroupByIdId: String!) {
    getGroupById(id: $getGroupByIdId) {
      group {
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
  }
`;

export const getGroupAdminsByIdQuery = gql`
  query GetGroupById($getGroupByIdId: String!) {
    getGroupById(id: $getGroupByIdId) {
      group {
        _id
        admins {
          username
          _id
        }
        creator {
          _id
        }
        name
        profilePhotoUrl
      }
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
          admins {
            _id
          }
        }
        isMember
        hasJoinRequest
        hasGroupRequest
      }
      hasMore
    }
  }
`;

export const getMemberPosts = gql`
  query GetPostsOfGroupMembers(
    $getPostsOfGroupMembersId: String!
    $limit: Float!
    $page: Float!
    $idsMembersArray: [String!]!
    $userLocation: UserLocation_group!
  ) {
    getPostsOfGroupMembers(
      id: $getPostsOfGroupMembersId
      limit: $limit
      page: $page
      userLocation: $userLocation
      idsMembersArray: $idsMembersArray
    ) {
      hasMore
      userAndPosts {
        author {
          username
          profilePhotoUrl
          name
          lastName
          _id
        }
        _id
        description
        frequencyPrice
        geoLocation {
          description
        }
        imagesUrls
        petitionType
        postType
        price
        title
        toPrice
        reviews {
          rating
          _id
        }
      }
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
    $newAdmin: String!
    $groupAdmin: String!
    $groupId: String!
  ) {
    addAdminsToGroupByGroupId(
      newAdmin: $newAdmin
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
  mutation RemoveAdminsFromGroupByGroupId(
    $adminsToDelete: [String!]!
    $groupCreator: String!
    $groupId: String!
  ) {
    removeAdminsFromGroupByGroupId(
      adminsToDelete: $adminsToDelete
      groupCreator: $groupCreator
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

export const acceptJoinRequestMutation = gql`
  mutation AcceptJoinGroupRequest(
    $newMember: String!
    $groupAdmin: String!
    $groupId: String!
  ) {
    acceptJoinGroupRequest(
      newMember: $newMember
      groupAdmin: $groupAdmin
      groupId: $groupId
    )
  }
`;

export const exitGroupMutation = gql`
  mutation ExitGroupById($groupExitRequest: GroupExitRequest!) {
    exitGroupById(groupExitRequest: $groupExitRequest)
  }
`;
