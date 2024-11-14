import gql from "graphql-tag";

export const createMagazineMutation = gql`
  mutation CreateMagazine($magazineCreateRequest: MagazineCreateRequest!) {
    createMagazine(magazineCreateRequest: $magazineCreateRequest)
  }
`;

export const getMagazinesQuery = gql`
  query GetAllMagazinesByUserId($userId: String!) {
    getAllMagazinesByUserId(userId: $userId) {
      _id
      name
      sections {
        _id
        isFatherSection
        posts {
          _id
        }
        title
      }
      ownerType
    }
  }
`;

export const getMagazineByIdQuery = gql`
  query GetMagazineByMagazineId($getMagazineByMagazineIdId: String!) {
    getMagazineByMagazineId(id: $getMagazineByMagazineIdId) {
      _id
      allowedCollaborators {
        username
        profilePhotoUrl
        _id
      }
      collaborators {
        username
        profilePhotoUrl
        _id
      }
      group {
        creator
        admins
        profilePhotoUrl
        name
        _id
      }
      description
      name
      ownerType
      sections {
        title
        posts {
          _id
          description
          frequencyPrice
          imagesUrls
          petitionType
          postType
          price
          title
        }
        isFatherSection
        _id
      }
      user {
        username
        profilePhotoUrl
        _id
      }
    }
  }
`;

export const getMagazineWithoutPostsByIdQuery = gql`
  query GetMagazineByMagazineId($getMagazineByMagazineIdId: String!) {
    getMagazineByMagazineId(id: $getMagazineByMagazineIdId) {
      _id
      allowedCollaborators {
        _id
        profilePhotoUrl
        username
      }
      collaborators {
        username
        profilePhotoUrl
        _id
      }
      description
      group {
        profilePhotoUrl
        name
        _id
      }
      name
      ownerType
      user {
        username
        profilePhotoUrl
        _id
      }
      visibility
    }
  }
`;

export const editMagazineMutation = gql`
  mutation UpdateMagazineById(
    $magazineUpdateRequest: MagazineUpdateRequest!
    $owner: String!
  ) {
    updateMagazineById(
      magazineUpdateRequest: $magazineUpdateRequest
      owner: $owner
    )
  }
`;

export const createMagazineSectionMutation = gql`
  mutation AddNewMagazineSection(
    $magazineAdmin: String!
    $magazineId: String!
    $section: MagazineSectionCreateRequest!
    $groupId: String
  ) {
    addNewMagazineSection(
      magazineAdmin: $magazineAdmin
      magazineId: $magazineId
      section: $section
      groupId: $groupId
    )
  }
`;

export const changeSectionNameMutation = gql`
  mutation UpdateTitleOfSectionById(
    $sectionId: String!
    $newTitle: String!
    $ownerType: OwnerType!
  ) {
    updateTitleOfSectionById(
      sectionId: $sectionId
      newTitle: $newTitle
      ownerType: $ownerType
    )
  }
`;

export const deleteSectionMutation = gql`
  mutation DeleteSectionFromMagazineById(
    $sectionIdsToDelete: [String!]!
    $magazineId: String!
    $allowedCollaboratorId: String
    $userMagazineAllowed: String
  ) {
    deleteSectionFromMagazineById(
      sectionIdsToDelete: $sectionIdsToDelete
      magazineId: $magazineId
      allowedCollaboratorId: $allowedCollaboratorId
      userMagazineAllowed: $userMagazineAllowed
    )
  }
`;

export const addPostMagazineUserMutation = gql`
  mutation AddPostInUserMagazine(
    $postId: String!
    $magazineAdmin: String!
    $magazineId: String!
    $sectionId: String!
  ) {
    addPostInUserMagazine(
      postId: $postId
      magazineAdmin: $magazineAdmin
      magazineId: $magazineId
      sectionId: $sectionId
    )
  }
`;

export const addPostMagazineGroupMutation = gql`
  mutation AddPostInGroupMagazine(
    $postId: [String!]!
    $magazineAdmin: String!
    $magazineId: String!
    $sectionId: String!
  ) {
    addPostInGroupMagazine(
      postId: $postId
      magazineAdmin: $magazineAdmin
      magazineId: $magazineId
      sectionId: $sectionId
    )
  }
`;

export const deletePostInSectionMutation = gql`
  mutation DeletePostInMagazineSection(
    $postIdToRemove: String!
    $sectionId: String!
    $ownerType: OwnerType!
    $magazineId: String
  ) {
    deletePostInMagazineSection(
      postIdToRemove: $postIdToRemove
      sectionId: $sectionId
      ownerType: $ownerType
      magazineId: $magazineId
    )
  }
`;

export const deleteCollaboratorMutation = gql`
  mutation DeleteCollaboratorsFromUserMagazine(
    $collaboratorsToDelete: [String!]!
    $magazineId: String!
    $magazineAdmin: String!
  ) {
    deleteCollaboratorsFromUserMagazine(
      collaboratorsToDelete: $collaboratorsToDelete
      magazineId: $magazineId
      magazineAdmin: $magazineAdmin
    )
  }
`;
