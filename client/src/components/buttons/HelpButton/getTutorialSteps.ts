import { useMemo } from "react";
import { homePageSteps } from "./tutorialSteps";

export const useTutorialSteps = (path: string) => {
  return useMemo(() => {
    switch (path) {
      case "/":
        return homePageSteps
    }
  }, [path]);
};
