"use client"
import { createContext, useContext, useState, ReactNode } from "react";

interface BackgroundContextType {
  gradientValue: number | number[];
  setGradientValue: (value: number | number[]) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [gradientValue, setGradientValue] = useState<number | number[]>(0);

  return (
    <BackgroundContext.Provider value={{ gradientValue, setGradientValue }}>
      {children}
    </BackgroundContext.Provider>
  );
};
