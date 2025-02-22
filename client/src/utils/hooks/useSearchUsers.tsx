import { getGroupMembersById } from "@/services/groupsService";
import { getFriendsOfUser, getUsers } from "@/services/userServices";
import { User } from "@/types/userTypes";
import { useEffect, useRef, useState, useCallback } from "react";
import { toastifyError } from "../functions/toastify";

const useSearchUsers = (
  isGroupMembersInviteId?: string,
  id?: string | null
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
    if (!id) return;
    getFriendsOfUser(id)
      .then((friends) => setUsers(friends))
      .catch(() =>
        toastifyError(
          "Error al traer las relaciones de amistad. Por favor intenta de nuevo."
        )
      );
  }, [id]);

  useEffect(() => {
    if (isGroupMembersInviteId) {
      getGroupMembers(isGroupMembersInviteId);
      return;
    }
    if (id) {
      getFriends();
      return;
    }
    getUsersByQuery("");
  }, [getFriends, isGroupMembersInviteId, id]);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
