import { getUsers } from "@/services/userServices";
import { User } from "@/types/userTypes";
import { useEffect, useState } from "react";

const useSearchUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const getUsersByQuery = (query: string | null) => {
    getUsers(query, 1).then((users) => setUsers(users.items));
  };

  useEffect(() => {
    getUsersByQuery("");
  }, []);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
