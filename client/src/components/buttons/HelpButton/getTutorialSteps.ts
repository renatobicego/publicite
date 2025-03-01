import { useMemo } from "react";
import { explorePostsSteps, homePageSteps } from "./tutorialSteps";

export const useTutorialSteps = (path: string) => {
  return useMemo(() => {
    switch (true) {
      case path === "/":
        return homePageSteps;
      case path === "/anuncios":
        return explorePostsSteps;
    }
  }, [path]);
};
