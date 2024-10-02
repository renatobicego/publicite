import { gql } from "@apollo/client";

export const createNewGroupMutation = gql`
  mutation CreateNewGroup($groupDto: GroupRequest!) {
    createNewGroup(groupDto: $groupDto) {
      _id
    }
  }
`;
