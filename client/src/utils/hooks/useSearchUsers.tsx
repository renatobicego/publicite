import { getGroupMembersById } from "@/services/groupsService";
import { getFriendsOfUser, getUsers } from "@/services/userServices";
import { User } from "@/types/userTypes";
import { useEffect, useRef, useState, useCallback } from "react";
import { toastifyError } from "../functions/toastify";

const useSearchUsers = (
  isGroupMembersInviteId?: string,
  username?: string | null
) => {
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
    getGroupMembersById(groupId).then((group) => setUsers(group.members));
  };

  const getFriends = useCallback(() => {
    if (!username) return;
    getFriendsOfUser(username)
      .then((friends) => setUsers(friends))
      .catch(() =>
        toastifyError(
          "Error al traer las relaciones de amistad. Por favor intenta de nuevo."
        )
      );
  }, [username]);

  useEffect(() => {
    if (isGroupMembersInviteId) {
      getGroupMembers(isGroupMembersInviteId);
      return;
    }
    if (username) {
      getFriends();
      return;
    }
    getUsersByQuery("");
  }, [getFriends, isGroupMembersInviteId, username]);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
