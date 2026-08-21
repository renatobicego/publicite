import gql from "graphql-tag";

const AVATAR_FIELDS = `
  _id
  userId
  name
  context
  seed
  createdAt
  updatedAt
`;

export const getUserAvatarsQuery = gql`
  query GetUserAvatars {
    getUserAvatars {
      ${AVATAR_FIELDS}
    }
  }
`;

export const createAvatarMutation = gql`
  mutation CreateAvatar($input: CreateAvatarRequest!) {
    createAvatar(input: $input) {
      ${AVATAR_FIELDS}
    }
  }
`;

export const updateAvatarMutation = gql`
  mutation UpdateAvatar($input: UpdateAvatarRequest!) {
    updateAvatar(input: $input) {
      ${AVATAR_FIELDS}
    }
  }
`;

export const deleteAvatarMutation = gql`
  mutation DeleteAvatar($avatarId: ID!) {
    deleteAvatar(avatarId: $avatarId)
  }
`;
