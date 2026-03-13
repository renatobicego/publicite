import { gql } from "@apollo/client";

export const getAllNoveltiesQuery = gql`
  query GetAllNovelties {
    getAllNovelties {
      _id
      blocks {
        type
        data
      }
      createdAt
      properties {
        value
        key
      }
      updatedAt
    }
  }
`;

export const getNoveltyByIdQuery = gql`
  query GetNoveltyById($id: String!) {
    getNoveltyById(id: $id) {
      _id
      blocks {
        type
        data
      }
      createdAt
      properties {
        value
        key
      }
      updatedAt
    }
  }
`;

export const createNewNoveltyMutation = gql`
  mutation CreateNewNovelty($noveltyDto: NoveltyRequest!) {
    createNewNovelty(noveltyDto: $noveltyDto) {
      _id
      blocks {
        type
        data
      }
      createdAt
      properties {
        value
        key
      }
      updatedAt
    }
  }
`;

export const updateNoveltyByIdMutation = gql`
  mutation UpdateNoveltyById($noveltyToUpdate: NoveltyUpdateRequest!) {
    updateNoveltyById(noveltyToUpdate: $noveltyToUpdate)
  }
`;

export const deleteNoveltyByIdMutation = gql`
  mutation DeleteNoveltyById($id: String!) {
    deleteNoveltyById(id: $id)
  }
`;
