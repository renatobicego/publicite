"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserPreferences } from "@/types/userTypes";
import { Magazine } from "@/types/magazineTypes";

interface MagazineContextType {
  magazines: Magazine[];
}

const MagazineContext = createContext<MagazineContextType | undefined>(
  undefined
);

export const useMagazine = () => {
  const context = useContext(MagazineContext);
  if (!context) {
    throw new Error("useMagazine must be used within a MagazineProvider");
  }
  return context;
};

export const MagazineProvider = ({
  children,
  username,
}: {
  children: ReactNode;
  username?: string | null;
}) => {
  const [magazines, setMagazines] = useState<Magazine[]>([]);

  // useEffect(() => {
  //   if (!username) return;
  //   const fetchMagazines = async () => {
  //     const magazines = await getMagazines(username);
  //     setMagazines(magazines);
  //   };
  //   fetchMagazines();
  // }, [username]);

  return (
    <MagazineContext.Provider value={{ magazines }}>
      {children}
    </MagazineContext.Provider>
  );
};
