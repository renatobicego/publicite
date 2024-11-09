"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserType } from "@/types/userTypes";
import { Magazine } from "@/types/magazineTypes";
import { getMagazinesOfUser } from "@/services/magazineService";
import { ConfigData, getConfigData } from "../(configuracion)/Profile/actions";

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
  configData?: ConfigData;
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
  token,
}: {
  children: ReactNode;
  username?: string | null;
  userId?: string;
  clerkId?: string;
  userType?: UserType;
  token: string;
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
  const [configData, setConfigData] = useState<ConfigData>();

  const fetchMagazines = async () => {
    if(!userId) return
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

  const fetchConfigData = async () => {
    if (!usernameLogged || !userIdLogged) return;
    const configData = await getConfigData({
      username: usernameLogged,
      id: userIdLogged,
    });
    setConfigData(configData);
  };
  useEffect(() => {
    fetchConfigData();
    fetchMagazines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        fetchMagazines,
        configData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
