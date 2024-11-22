import { getGroupMembersById } from "@/services/groupsService";
import { getUsers } from "@/services/userServices";
import { User } from "@/types/userTypes";
import { useEffect, useRef, useState } from "react";

const useSearchUsers = (isGroupMembersInviteId?: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const lastChange = useRef<NodeJS.Timeout | null>(null);
  const getUsersByQuery = (query: string | null) => {
    if (lastChange.current) {
      clearTimeout(lastChange.current);
    }

    lastChange.current = setTimeout(() => {
      lastChange.current = null;
      getUsers(query, 1).then((users) => setUsers(users.items));
    }, 1000);
  };

  const getGroupMembers = (groupId: string) => {
    if (lastChange.current) {
      clearTimeout(lastChange.current);
    }
    lastChange.current = setTimeout(() => {
      lastChange.current = null;
      getGroupMembersById(groupId).then((group) => setUsers(group.members));
    }, 1000);
  };

  useEffect(() => {
    if (isGroupMembersInviteId) {
      getGroupMembers(isGroupMembersInviteId);
      return;
    }
    getUsersByQuery("");
  }, [isGroupMembersInviteId]);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
