import { gql } from "@apollo/client";

const getUserByUsernameQuery = gql`
  query GetUserByUsername($username: String!) {
    findOneByUsername(username: $username) {
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
      post {
        _id
        description
        frequencyPrice
        petitionType
        postType
        price
        title
        toPrice
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
      }
    }
  }
`;

export default getUserByUsernameQuery;
