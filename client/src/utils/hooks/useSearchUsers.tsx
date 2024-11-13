import { getGroupMembersById } from "@/services/groupsService";
import { getUsers } from "@/services/userServices";
import { User } from "@/types/userTypes";
import { useEffect, useState } from "react";

const useSearchUsers = (isGroupMembersInviteId?: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const getUsersByQuery = (query: string | null) => {
    getUsers(query, 1).then((users) => setUsers(users.items));
  };

  const getGroupMembers = (groupId: string) => {
    getGroupMembersById(groupId).then((group) => setUsers(group.members));
  }

  useEffect(() => {
    if (isGroupMembersInviteId) {
      getGroupMembers(isGroupMembersInviteId);
      return
    }
    getUsersByQuery("");
  }, [isGroupMembersInviteId]);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
