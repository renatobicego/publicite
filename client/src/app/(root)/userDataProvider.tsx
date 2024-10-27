"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserPreferences, UserType } from "@/types/userTypes";
import { Magazine } from "@/types/magazineTypes";

interface UserDataContextType {
  magazines: Magazine[];
  usernameLogged: string | null | undefined;
  userIdLogged: string | undefined;
  clerkIdLogged: string | undefined;
  userTypeLogged?: UserType;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

export const UserDataProvider = ({
  children,
  username,
  userId,
  clerkId,
  userType,
}: {
  children: ReactNode;
  username?: string | null;
  userId?: string;
  clerkId?: string;
  userType?: UserType;
}) => {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [usernameLogged, setUsernameLogged] = useState<
    string | null | undefined
  >(username);
  const [userIdLogged, setUserIdLogged] = useState<string | undefined>(userId);
  const [clerkIdLogged, setClerkIdLogged] = useState<string | undefined>(
    clerkId
  );
  const [userTypeLogged, setUserType] = useState<UserType | undefined>(
    userType
  );

  // useEffect(() => {
  //   if (!username) return;
  //   const fetchMagazines = async () => {
  //     const magazines = await getMagazines(username);
  //     setMagazines(magazines);
  //   };
  //   fetchMagazines();
  // }, [username]);

  return (
    <UserDataContext.Provider
      value={{
        magazines,
        usernameLogged,
        userIdLogged,
        clerkIdLogged,
        userTypeLogged,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
