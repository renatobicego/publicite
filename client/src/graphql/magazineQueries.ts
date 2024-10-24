import gql from "graphql-tag";

export const createMagazineMutation = gql`
  mutation CreateMagazine($magazineCreateRequest: MagazineCreateRequest!) {
    createMagazine(magazineCreateRequest: $magazineCreateRequest)
  }
`;

export const getMagazineByIdQuery = gql`
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
      sections {
        _id
        isFatherSection
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
        title
      }
      user {
        username
        profilePhotoUrl
        _id
      }
      visibility
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
`

export const editMagazineMutation = gql`
  mutation UpdateMagazineById($magazineUpdateRequest: MagazineUpdateRequest!, $owner: String!) {
    updateMagazineById(magazineUpdateRequest: $magazineUpdateRequest, owner: $owner)
  }
`;
