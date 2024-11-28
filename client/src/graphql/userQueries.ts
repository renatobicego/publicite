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

export default getUserByUsernameQuery;
