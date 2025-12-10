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
      comments {
        _id
        user {
          username
          profilePhotoUrl
          _id
        }
        isEdited
        createdAt
        comment
        response {
          _id
          user {
            username
            profilePhotoUrl
            _id
          }
          isEdited
          createdAt
          comment
        }
      }
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
      reviews {
        review
        rating
        date
        author
        _id
      }
      title
      isActive
      toPrice
      visibility {
        post
        socialMedia
      }
      year
      endDate
    }
  }
`;

export const getPostsByIdAndRecommendationsQuery = gql`
  query FindPostByIdAndCategoryPostsRecomended(
    $findPostByIdAndCategoryPostsRecomendedId: String!
  ) {
    findPostByIdAndCategoryPostsRecomended(
      id: $findPostByIdAndCategoryPostsRecomendedId
    ) {
      post {
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
        comments {
          _id
          user {
            username
            profilePhotoUrl
            _id
          }
          isEdited
          createdAt
          comment
          response {
            _id
            user {
              username
              profilePhotoUrl
              _id
            }
            isEdited
            createdAt
            comment
          }
        }
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
        reviews {
          review
          rating
          date
          author
          _id
        }
        title
        isActive
        toPrice
        visibility {
          post
          socialMedia
        }
        year
      }
      recomended {
        title
        price
        postType
        description
        _id
        imagesUrls
        frequencyPrice
        toPrice
        reviews {
          rating
          _id
        }
        petitionType
      }
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
        reviews {
          rating
          _id
        }
        toPrice
        geoLocation {
          description
        }
      }
    }
  }
`;

export const getAllPostsQuery = gql`
  query FindAllPosts(
    $page: Float!
    $limit: Float!
    $userLocation: UserLocation!
    $searchTerm: String
  ) {
    findAllPosts(
      page: $page
      limit: $limit
      userLocation: $userLocation
      searchTerm: $searchTerm
    ) {
      hasMore
      posts {
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
          reviews {
            rating
            _id
          }
          toPrice
          geoLocation {
            description
          }
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
        reviews {
          rating
          _id
        }
        toPrice
        geoLocation {
          description
        }
      }
    }
  }
`;

export const getAllPostsOfFriendsQuery = gql`
  query FindAllFriendPosts(
    $page: Float!
    $limit: Float!
    $searchTerm: String
    $visibility: Visibility_Of_Find!
  ) {
    findAllFriendPosts(
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
        reviews {
          rating
          _id
        }
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

export const getActiveRelationsQuery = gql`
  query GetActiveRelationsOfUser {
    getActiveRelationsOfUser {
      _id
      typeRelationA
      typeRelationB
      userA
      userB
    }
  }
`;

export const getMatchPostQuery = gql`
  query FindMatchPost($postType: PostType!, $searchTerm: String!) {
    findMatchPost(postType: $postType, searchTerm: $searchTerm) {
      _id
      title
      description
      frequencyPrice
      imagesUrls
      petitionType
      postType
      price
      reviews {
        rating
        _id
      }
      toPrice
    }
  }
`;

export const deleteCommentMutation = gql`
  mutation DeleteCommentById(
    $id: String!
    $isAuthorOfPost: Boolean!
    $isReply: Boolean!
  ) {
    deleteCommentById(
      _id: $id
      isAuthorOfPost: $isAuthorOfPost
      isReply: $isReply
    )
  }
`;
