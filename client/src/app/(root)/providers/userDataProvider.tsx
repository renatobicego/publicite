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
import { getMagazinesOfUser } from "@/services/magazineService";

interface UserDataContextType {
  magazines: Magazine[];
  usernameLogged: string | null | undefined;
  userIdLogged: string | undefined;
  clerkIdLogged: string | undefined;
  userTypeLogged?: UserType;
  postsInMagazine: {
    postId: string;
    section: string;
  }[];
  fetchMagazines: () => Promise<void>;
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
  const [postsInMagazine, setPostsInMagazine] = useState<
    {
      postId: string;
      section: string;
    }[]
  >([]);
  const [usernameLogged] = useState<string | null | undefined>(username);
  const [userIdLogged] = useState<string | undefined>(userId);
  const [clerkIdLogged] = useState<string | undefined>(clerkId);
  const [userTypeLogged] = useState<UserType | undefined>(userType);

  const fetchMagazines = async () => {
    const magazines: Magazine[] = await getMagazinesOfUser();
    setMagazines(magazines);
    // Flatten post IDs from each magazine's sections
    const postsIds = magazines.flatMap((magazine) =>
      magazine.sections.flatMap((section) =>
        section.posts.map((post) => ({
          postId: post._id,
          section: section._id,
        }))
      )
    );
    setPostsInMagazine(postsIds);
  };
  useEffect(() => {
    fetchMagazines();
  }, []);
  return (
    <UserDataContext.Provider
      value={{
        magazines,
        usernameLogged,
        userIdLogged,
        clerkIdLogged,
        userTypeLogged,
        postsInMagazine,
        fetchMagazines
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};