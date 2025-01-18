"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  changeUserPreferences,
  getUserPreferences,
} from "../../../services/userServices";
import { UserPreferences } from "@/types/userTypes";
import {
  toastifyError,
  toastifySuccess,
} from "../../../utils/functions/toastify";

interface BackgroundContextType {
  gradientValue: number | number[];
  setGradientValue: (value: number | number[]) => void;
  postGradientValue: (userPreferences: UserPreferences) => Promise<void>;
  resetValue: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined
);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};

export const BackgroundProvider = ({
  children,
  username,
}: {
  children: ReactNode;
  username?: string | null;
}) => {
  const [gradientValue, setGradientValue] = useState<number | number[]>(0);

  // Load background color from localStorage for the current user
  useEffect(() => {
    if (!username) return;

    const storedGradientValue = sessionStorage.getItem(
      `backgroundColor_${username}`
    );
    if (storedGradientValue) {
      setGradientValue(parseInt(JSON.parse(storedGradientValue)));
    } else {
      // Fetch user preferences from the server if not found in sessionStorage
      const fetchPreferences = async () => {
        const preferences = await getUserPreferences(username);
        if (preferences) {
          setGradientValue(
            preferences.backgroundColor ? preferences.backgroundColor : 0
          );
          sessionStorage.setItem(
            `backgroundColor_${username}`,
            JSON.stringify(
              preferences.backgroundColor ? preferences.backgroundColor : 0
            )
          );
        }
      };
      fetchPreferences();
    }
  }, [username]);

  useEffect(() => {
    const opacity = (gradientValue as number) / 100;
    const gradient = `radial-gradient(circle at 10% 20%, 
          rgba(255, 131, 61, ${opacity}) 0%, 
          rgba(249, 183, 23, ${opacity}) 90%)`;

    document.body.style.background = gradient;
  }, [gradientValue]);

  const resetValue = () => {
    const storedGradientValue = sessionStorage.getItem(
      `backgroundColor_${username}`
    );
    if (storedGradientValue) {
      setGradientValue(parseInt(JSON.parse(storedGradientValue)));
      return;
    }
    setGradientValue(0);
  };

  // Update user preferences on the server and in sessionStorage
  const postGradientValue = async (userPreferences: UserPreferences) => {
    const res = await changeUserPreferences({
      ...userPreferences,
      backgroundColor: gradientValue as number,
    });

    if (res.error) {
      toastifyError(res.error);
    } else {
      toastifySuccess("Preferencias guardadas");
      // Save to sessionStorage under the specific username
      sessionStorage.removeItem(`backgroundColor_${username}`);
      sessionStorage.setItem(
        `backgroundColor_${username}`,
        JSON.stringify(gradientValue)
      );
      setGradientValue(gradientValue);
    }
  };

  return (
    <BackgroundContext.Provider
      value={{
        gradientValue,
        setGradientValue,
        postGradientValue,
        resetValue,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};
