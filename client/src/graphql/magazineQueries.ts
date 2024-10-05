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
      allowedColaborators
      collaborators
      description
      group
      name
      ownerType
      sections
      user
      visibility
    }
  }
`;
