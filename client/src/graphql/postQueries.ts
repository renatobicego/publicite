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
      category {
        _id
        label
      }
      author {
        contact {
          _id
          facebook
          instagram
          phone
          website
          x
        }
        lastName
        name
        profilePhotoUrl
        username
      }
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

export const editPostMutation = gql`
  mutation UpdatePostById(
    $postUpdate: PostUpdateRequest!
    $updatePostByIdId: String!
    $authorId: String!
  ) {
    updatePostById(
      postUpdate: $postUpdate
      id: $updatePostByIdId
      author_id: $authorId
    )
  }
`;
