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
        _id
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
      reactions {
        user
        reaction
        _id
      }
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
      postBehaviourType
      postType
      price
      reviews
      title
      isActive
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
    $visibility: Visibility_Of_Find!
  ) {
    findFriendPosts(
      postType: $postType
      page: $page
      limit: $limit
      searchTerm: $searchTerm
      visibility: $visibility
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

export const updateEndDtaeMutation = gql`
  mutation UpdateEndDate($postId: String!, $newDate: DateTime!) {
    updateEndDate(postId: $postId, newDate: $newDate)
  }
`;

export const deletePostReactionMutation = gql`
  mutation RemoveReactionFromPost($id: String!) {
    removeReactionFromPost(_id: $id)
  }
`;

export const changePostBehaviourTypeMutation = gql`
  mutation Mutation(
    $id: String!
    $postBehaviourType: PostBehaviourType!
    $authorId: String!
    $visibility: VisibilityEnum!
  ) {
    updateBehaviourType(
      _id: $id
      postBehaviourType: $postBehaviourType
      author_id: $authorId
      visibility: $visibility
    )
  }
`;

export const putActiveStatusMutation = gql`
  mutation ActivateOrDeactivatePost(
    $id: String!
    $authorId: String!
    $postBehaviourType: PostBehaviourType!
    $activate: Boolean!
  ) {
    activateOrDeactivatePost(
      _id: $id
      author_id: $authorId
      postBehaviourType: $postBehaviourType
      activate: $activate
    )
  }
`;
