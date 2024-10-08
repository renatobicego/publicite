import gql from "graphql-tag";

export const getPostByIdQuery = gql`
  query FindPostById($findPostByIdId: String!) {
    findPostById(id: $findPostByIdId) {
      _id
      attachedFiles {
        label
        url
      }
      brand
      category
      comments
      condition
      createAt
      description
      frequencyPrice
      imagesUrls
      location {
        _id
        description
        location {
          coordinates
          type
        }
        userSetted
      }
      modelType
      petitionType
      postType
      price
      reviews
      title
      toPrice
      visibility {
        post
        socialMedia
      }
      year
    }
  }
`;

export const getPostCategories = gql`
  query GetAllCategoryPost {
    getAllCategoryPost {
      _id
      label
    }
  }
`;
