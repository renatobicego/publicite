import { gql } from "@apollo/client";

const getUserByUsernameQuery = gql`
  query GetUserByUsername($username: String!) {
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

export default getUserByUsernameQuery;
