import { getUsers } from "@/services/userServices";
import { useEffect, useState } from "react";

const useSearchUsers = () => {
  const [users, setUsers] = useState([]);
  const getUsersByQuery = (query: string | null) => {
    getUsers(query, 1).then((users) => setUsers(users.items));
  };

  useEffect(() => {
    getUsersByQuery("");
  }, []);

  return { users, setUsers, getUsersByQuery };
};

export default useSearchUsers;
