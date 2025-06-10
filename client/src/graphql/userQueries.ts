import { gql } from "@apollo/client";

const getUserByIdQuery = gql`
  query FindUserById($id: String!) {
    findUserById(_id: $id) {
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
        reviews {
          _id
          rating
        }
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
      isAcceptRequestFriend {
        notification_id
        type
        value
        userRelationId
        toRelationShipChange
        newRelation
      }
    }
  }
`;

export const getFriendsQuery = gql`
  query FindUserById($id: String!) {
    findUserById(_id: $id) {
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
    }
  }
`;

export const getFriendRequestsQuery = gql`
  query FindUserById($id: String!) {
    findUserById(_id: $id) {
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
          subscriptionPlan {
            status
            retryAttemp
            reason
            _id
          }
          group {
            _id
            name
            profilePhotoUrl
            userInviting {
              _id
              username
            }
          }
          subscription {
            event
          }
          share {
            _id
            description
            imageUrl
            type
            username
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
          contactSeller {
            client {
              _id
              email
              lastName
              message
              name
              phone
              username
            }
            post {
              _id
              title
              description
              frequencyPrice
              imagesUrls
              petitionType
              postType
              price
              toPrice
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
          postCalification {
            contactSeller_id
            postCalificationType
            post {
              _id
              author
              description
              imagesUrls
              postType
              title
            }
            review {
              author
              date
              rating
              review
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

export const putActiveRelationsMutation = gql`
  mutation SetNewActiveUserRelations($activeRelations: [String!]!) {
    setNewActiveUserRelations(activeRelations: $activeRelations)
  }
`;

export const getContactSellersByTypeQuery = gql`
  query GetContactSellerById(
    $contactSellerGetType: contactSellerGetType!
    $id: String!
    $limit: Float!
    $page: Float!
  ) {
    getContactSellerById(
      contactSellerGetType: $contactSellerGetType
      _id: $id
      limit: $limit
      page: $page
    ) {
      hasMore
      contactSeller {
        client {
          clientId
          username
          phone
          name
          lastName
          email
          message
        }
        date
        isOpinionRequested
        post {
          _id
          toPrice
          title
          price
          postType
          petitionType
          imagesUrls
          frequencyPrice
          description
        }
        _id
      }
    }
  }
`;

export const deleteNotificationMutation = gql`
  mutation DeleteNotificationById($event: String!, $id: String!) {
    deleteNotificationById(event: $event, _id: $id)
  }
`;

export default getUserByIdQuery;
