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
      geoLocation {
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

export const postPostMutation = gql`
  mutation CreatePost($postRequest: PostRequest!, $authorId: String!) {
    createPost(postRequest: $postRequest, author_id: $authorId) {
      _id
    }
  }
`;

export const getPostsQuery = gql`
  query FindAllPostByPostType(
    $page: Float!
    $postType: PostType!
    $limit: Float!
    $searchTerm: String
    $userLocation: UserLocation!
  ) {
    findAllPostByPostType(
      page: $page
      postType: $postType
      limit: $limit
      searchTerm: $searchTerm
      userLocation: $userLocation
    ) {
      hasMore
      posts {
        _id
        title
        description
        frequencyPrice
        imagesUrls
        petitionType
        postType
        price
        reviews
        toPrice
        geoLocation {
          description
        }
      }
    }
  }
`;

export const getPostsOfFriendsQuery = gql`
  query FindFriendPosts(
    $postType: PostType!
    $page: Float!
    $limit: Float!
    $searchTerm: String
  ) {
    findFriendPosts(
      postType: $postType
      page: $page
      limit: $limit
      searchTerm: $searchTerm
    ) {
      hasMore
      posts {
        _id
        title
        description
        frequencyPrice
        imagesUrls
        petitionType
        postType
        price
        reviews
        toPrice
        geoLocation {
          description
        }
      }
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

export const deletePostMutation = gql`
  mutation DeletePostById($deletePostByIdId: String!, $authorId: String!) {
    deletePostById(id: $deletePostByIdId, author_id: $authorId)
  }
`;
