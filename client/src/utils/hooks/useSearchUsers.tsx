import { getGroupMembersById } from "@/services/groupsService";
import { getFriendsOfUser, getUsers } from "@/services/userServices";
import { User } from "@/types/userTypes";
import { useEffect, useRef, useState, useCallback } from "react";
import { toastifyError } from "../functions/toastify";

/**
 * @param enabled en false no pide nada. ShareButton lo usa para pedir los amigos
 *   recién al abrir el modal: hay un botón por tarjeta de anuncio y cada uno pedía
 *   la lista entera al aparecer (y sin sesión, la lista de usuarios).
 */
const useSearchUsers = (
  isGroupMembersInviteId?: string,
  id?: string | null,
  enabled = true
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
    if (!enabled) return;
    if (isGroupMembersInviteId) {
      getGroupMembers(isGroupMembersInviteId);
      return;
    }
    if (id) {
      getFriends();
      return;
    }
    getUsersByQuery("");
  }, [getFriends, isGroupMembersInviteId, id, enabled]);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
