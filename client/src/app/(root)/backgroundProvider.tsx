"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { changeUserPreferences, getUserPreferences } from "../../services/userServices";
import { UserPreferences } from "@/types/userTypes";
import { toastifyError, toastifySuccess } from "../../utils/functions/toastify";

interface BackgroundContextType {
  gradientValue: number | number[];
  setGradientValue: (value: number | number[]) => void;
  postGradientValue: (userPreferences: UserPreferences) => Promise<void>;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};

export const BackgroundProvider = ({ children, username }: { children: ReactNode; username?: string | null }) => {
  const [gradientValue, setGradientValue] = useState<number | number[]>(0);

  // Load background color from localStorage for the current user
  useEffect(() => {
    if(!username) return
    const storedGradientValue = localStorage.getItem(`backgroundColor_${username}`);
    if (storedGradientValue) {
      setGradientValue(JSON.parse(storedGradientValue));
    } else {
      // Fetch user preferences from the server if not found in localStorage
      const fetchPreferences = async () => {
        const preferences = await getUserPreferences(username);
        if (preferences && preferences.backgroundColor) {
          setGradientValue(preferences.backgroundColor);
          localStorage.setItem(`backgroundColor_${username}`, JSON.stringify(preferences.backgroundColor));
        }
      };
      fetchPreferences();
    }
  }, [username]);

  // Update user preferences on the server and in localStorage
  const postGradientValue = async (userPreferences: UserPreferences) => {
    const res = await changeUserPreferences({
      ...userPreferences,
      backgroundColor: gradientValue as number,
    });

    if (res.error) {
      toastifyError(res.error);
    } else {
      toastifySuccess("Preferencias guardadas");
      // Save to localStorage under the specific username
      localStorage.setItem(`backgroundColor_${username}`, JSON.stringify(gradientValue));
    }
  };

  return (
    <BackgroundContext.Provider
      value={{ gradientValue, setGradientValue, postGradientValue }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};
