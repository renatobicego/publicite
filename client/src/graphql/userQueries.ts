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
  query GetAllNotificationsFromUserById(
    $getAllNotificationsFromUserByIdId: String!
    $limit: Float!
    $page: Float!
  ) {
    getAllNotificationsFromUserById(
      id: $getAllNotificationsFromUserByIdId
      limit: $limit
      page: $page
    ) {
      notifications {
        _id
        notification {
          backData {
            userIdTo
            userIdFrom
          }
          date
          event
          viewed
        }
        frontData {
          group {
            profilePhotoUrl
            name
            _id
          }
          userInviting {
            username
          }
          magazine {
            _id
            name
          }
        }
      }
      hasMore
    }
  }
`;

export default getUserByUsernameQuery;
