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
      allowedColaborators {
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
