import { gql } from "@apollo/client";

const getUserByUsernameQuery = gql`
  query FindUserByUsername($username: String!) {
    findUserByUsername(username: $username) {
      _id
      businessName
      contact {
        _id
        facebook
        instagram
        phone
        website
        x
      }
      countryRegion
      description
      lastName
      name
      posts {
        _id
        description
        frequencyPrice
        petitionType
        postType
        price
        title
        toPrice
        imagesUrls
        endDate
        isActive
      }
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
      groups {
        _id
        members
        admins
        name
        profilePhotoUrl
      }
      magazines {
        _id
        name
        sections {
          posts {
            _id
            imagesUrls
          }
        }
      }
      userRelations {
        _id
        typeRelationA
        typeRelationB
        userA {
          _id
          businessName
          lastName
          name
          profilePhotoUrl
          userType
          username
        }
        userB {
          _id
          businessName
          username
          userType
          profilePhotoUrl
          name
          lastName
        }
      }
      isFriendRequestPending
    }
  }
`;

export const getFriendRequestsQuery = gql`
  query FindUserByUsername($username: String!) {
    findUserByUsername(username: $username) {
      _id
      friendRequests {
        event
        _id
        backData {
          userIdFrom
        }
        frontData {
          userRelation {
            _id
            typeRelation
            userFrom {
              _id
              profilePhotoUrl
              username
            }
          }
        }
      }
    }
  }
`;

export const getAllNotificationsQuery = gql`
  query GetAllNotificationsFromUserById($limit: Float!, $page: Float!) {
    getAllNotificationsFromUserById(limit: $limit, page: $page) {
      hasMore
      notifications {
        _id
        backData {
          userIdFrom
          userIdTo
        }
        date
        event
        user
        isActionsAvailable
        viewed
        frontData {
          group {
            _id
            name
            profilePhotoUrl
            userInviting {
              _id
              username
            }
          }
          userRelation {
            userFrom {
              _id
              username
              profilePhotoUrl
            }
            typeRelation
            _id
          }
          magazine {
            _id
            groupInviting {
              _id
              name
            }
            name
            ownerType
            userInviting {
              _id
              username
            }
          }
          postActivity {
            notificationPostType
            user {
              username
            }
            postReaction {
              emoji
            }
            postComment {
              comment
            }
            postResponse {
              author
              commentId
              response
            }
            post {
              _id
              title
              imageUrl
              postType
            }
          }
        }
      }
    }
  }
`;

export const changeNotificationStatusMutation = gql`
  mutation ChangeNotificationStatus(
    $notificationIds: [String!]!
    $view: Boolean!
  ) {
    changeNotificationStatus(notificationIds: $notificationIds, view: $view)
  }
`;

export const updateContactMutation = gql`
  mutation UpdateContactById(
    $contactId: String!
    $updateRequest: UpdateContactRequest!
  ) {
    updateContactById(contactId: $contactId, updateRequest: $updateRequest)
  }
`;

export const deleteUserRelationMutation = gql`
  mutation RemoveFriend($relationId: String!) {
    removeFriend(relationId: $relationId)
  }
`;

export default getUserByUsernameQuery;
